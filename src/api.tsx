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

// Create Axios Instance
export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Add Request Interceptor
axiosInstance.interceptors.request.use(async (config) => {
  // Get Authorization token
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Get Language settings using STORE_LANGUAGE_KEY
  const language = (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
  config.headers["Accept-Language"] = language;

  return config;
});

// Add Response Interceptor
axiosInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    if (error?.response?.status === 401) {
      // Clear token and log out
      await AsyncStorage.removeItem("access_token");
      console.log("Session expired, logging out...");
    } else {
      console.log(error); // Log other errors
    }

    throw error;
  }
);

// Define Types
export declare namespace API {
  export type BaseResponse = {
    httpStatus: 200;
    created_at: string;
  };
  export type TestResponse = { value: string };
}

// Interface for Custom Query Options
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

// Helper Function for Request Configuration
const getRequestConfig = (args: string | AxiosRequestConfig) => {
  if (typeof args === "string") {
    return { url: args };
  }
  return args;
};

// Custom Axios Query for RTK Query
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
        return {
          error: err,
          meta,
        };
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

// RTK Query API Setup
export const restApi = createApi({
  reducerPath: "restApi",
  baseQuery: axiosBaseQuery({
    transformResponse: (response) => response,
  }),
  tagTypes: ["City", "Users", "Cities", "Countries", "Client", "Notifications"],
  endpoints: () => ({}),
});
