// src/api.ts
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

// REQUEST: Bearer + Accept-Language
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) setHeader(config, "Authorization", `Bearer ${token}`);

  const language = (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
  setHeader(config, "Accept-Language", language);

  return config;
});

// helper: обновить access_token по refresh_token
async function refreshAccessToken(): Promise<string | null> {
  const refresh = await AsyncStorage.getItem("refresh_token");
  if (!refresh) return null;

  const resp = await rawAxios.post("/api/v1/auth/token/refresh", { refresh });
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

// RESPONSE: 401 → refresh один раз
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
      (original as any)._retry = true;

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
      if (onAuthFailCallback) onAuthFailCallback();
    }

    throw error;
  }
);

// ===== типы и baseQuery
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
        signal: (api as any).signal,
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
