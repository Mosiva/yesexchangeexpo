// api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type BaseQueryApi,
  type BaseQueryFn,
  createApi,
} from "@reduxjs/toolkit/query/react";
import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from "axios";
import { STORE_LANGUAGE_KEY } from "./local/i18n";

let onAuthFailCallback: (() => void) | null = null;
export const setOnAuthFail = (cb: () => void) => {
  onAuthFailCallback = cb;
};

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// CSRF refresher (инжектируется из auth.ts)
let csrfRefresher: null | (() => Promise<string | null>) = null;
let csrfRefreshPromise: Promise<string | null> | null = null;
export const setCsrfRefresher = (fn: () => Promise<string | null>) => {
  csrfRefresher = fn;
};

// отдельный инстанс без интерсепторов — для refresh запроса
const rawAxios = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

let accessRefreshPromise: Promise<string | null> | null = null;

const setHeader = (cfg: any, key: string, val: string) => {
  if (cfg.headers?.set) cfg.headers.set(key, val);
  else {
    cfg.headers = cfg.headers || {};
    cfg.headers[key] = val;
  }
};

// REQUEST: Bearer + Lang + CSRF (только для мутаций)
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) setHeader(config, "Authorization", `Bearer ${token}`);

  const language = (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
  setHeader(config, "Accept-Language", language);

  const method = (config.method || "get").toLowerCase();
  const isMutating = ["post", "put", "patch", "delete"].includes(method);
  if (isMutating) {
    const csrftoken = await AsyncStorage.getItem("csrf_token");
    if (csrftoken) setHeader(config, "X-CSRFToken", csrftoken);
  }

  return config;
});

// helper: обновить access_token по refresh_token
async function refreshAccessToken(): Promise<string | null> {
  const refresh = await AsyncStorage.getItem("refresh_token");
  if (!refresh) return null;

  const resp = await rawAxios.post("/auth/token/refresh/", { refresh });
  const d = resp.data || {};
  const newAccess = d.access ?? d.access_token ?? null;
  const newRefresh = d.refresh ?? d.refresh_token ?? null;

  if (!newAccess) {
    if (onAuthFailCallback) onAuthFailCallback();
    return null;
  }
  await AsyncStorage.setItem("access_token", newAccess);
  if (newRefresh) await AsyncStorage.setItem("refresh_token", newRefresh);
  return newAccess;
}

// RESPONSE: 401 → refresh; 419/403(csrf) → обновить CSRF и ретрай
axiosInstance.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    // --- 401: пробуем авто-рефреш access_token один раз
    if (
      status === 401 &&
      original &&
      !original._retry &&
      // не пытаемся рефрешить на самом вызове refresh/login
      !String(original.url || "").includes("/auth/token/refresh/") &&
      !String(original.url || "").includes("/auth/login")
    ) {
      original._retry = true;

      if (!accessRefreshPromise) {
        accessRefreshPromise = refreshAccessToken().finally(() => {
          accessRefreshPromise = null;
        });
      }
      const newAccess = await accessRefreshPromise;

      if (newAccess) {
        // проставим новый Bearer и повторим запрос
        if (original.headers?.set)
          original.headers.set("Authorization", `Bearer ${newAccess}`);
        else {
          original.headers = original.headers || {};
          original.headers["Authorization"] = `Bearer ${newAccess}`;
        }
        return axiosInstance(original);
      }

      // рефреш не удался — чистим access_token (и дальше ошибка пойдёт наверх)
      await AsyncStorage.removeItem("access_token");
    }

    // --- 419/403 с CSRF: обновим CSRF и ретрай (один раз)
    const isCsrfError =
      status === 419 ||
      (status === 403 &&
        (typeof error?.response?.data === "string"
          ? error.response.data.toLowerCase().includes("csrf")
          : JSON.stringify(error?.response?.data || {})
              .toLowerCase()
              .includes("csrf")));

    if (isCsrfError && original && !original._retry && csrfRefresher) {
      original._retry = true;
      if (!csrfRefreshPromise) {
        csrfRefreshPromise = csrfRefresher().finally(() => {
          csrfRefreshPromise = null;
        });
      }
      const newCsrf = await csrfRefreshPromise;
      if (newCsrf) {
        if (original.headers?.set) original.headers.set("X-CSRFToken", newCsrf);
        else {
          original.headers = original.headers || {};
          original.headers["X-CSRFToken"] = newCsrf;
        }
        return axiosInstance(original);
      }
    }

    throw error;
  }
);

// ===== типы и baseQuery (как у тебя)
export declare namespace API {
  export type BaseResponse = { httpStatus: 200; created_at: string };
  export type TestResponse = { value: string };
}

export interface AxiosBaseQueryArgs<Meta, Response = API.BaseResponse> {
  meta?: Meta;
  prepareHeaders?: (
    headers: AxiosRequestHeaders,
    api: BaseQueryApi
  ) => AxiosRequestHeaders;
  transformResponse?: (response: Response) => unknown;
}

export interface ServiceExtraOptions {
  authRequired?: boolean;
}

const getRequestConfig = (args: string | AxiosRequestConfig) =>
  typeof args === "string" ? { url: args } : args;

const axiosBaseQuery = <
  Args extends AxiosRequestConfig | string = AxiosRequestConfig,
  Result = unknown,
  DefinitionExtraOptions extends ServiceExtraOptions = Record<string, unknown>,
  Meta = Record<string, unknown>
>({
  prepareHeaders,
  meta,
  transformResponse,
}: AxiosBaseQueryArgs<Meta> = {}): BaseQueryFn<
  Args,
  Result,
  unknown,
  DefinitionExtraOptions,
  Meta
> => {
  return async (args, api, extraOptions) => {
    try {
      const requestConfig = getRequestConfig(args);
      const result = await axiosInstance({
        ...requestConfig,
        headers: prepareHeaders
          ? prepareHeaders(
              (requestConfig.headers || {}) as AxiosRequestHeaders,
              api
            )
          : requestConfig.headers,
        signal: api.signal,
        ...extraOptions,
      });
      return {
        data: transformResponse ? transformResponse(result.data) : result.data,
      };
    } catch (err) {
      if (!axios.isAxiosError(err)) {
        return { error: err, meta };
      }
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
        meta,
      };
    }
  };
};

export const restApi = createApi({
  reducerPath: "restApi",
  baseQuery: axiosBaseQuery({
    transformResponse: (response) => response,
  }),
  tagTypes: ["City", "Users", "Cities", "Countries", "Client", "Notifications"],
  endpoints: () => ({}),
});
