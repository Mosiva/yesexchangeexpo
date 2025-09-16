// services/auth.ts
import { restApi } from "../api";
import type { Credentials, User } from "../types"; // ← было Cridentials

type LoginResponse = {
  access: string; // бэк сейчас так отдаёт
  refresh: string;
  user?: User;
};
type RefreshResponse = { access: string; refresh?: string };
type CsrfResponse = { csrfToken: string };

export const authApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, Credentials>({
      query: (credentials) => ({
        url: "/auth/login/", // ← трейлинг-слэш ОК
        method: "POST",
        data: credentials,
      }),
    }),

    refreshToken: builder.mutation<RefreshResponse, { refresh: string }>({
      query: (body) => ({
        url: "/auth/token/refresh/", // ← трейлинг-слэш ОК
        method: "POST",
        data: body, // { refresh: "<refresh_token>" }
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout/", // ← ДОБАВИЛ слэш
        method: "POST", // CSRF придёт из интерсептора
      }),
    }),

    getCSRF: builder.query<CsrfResponse, void>({
      query: () => ({
        url: "/auth/csrf/",
        method: "GET",
      }),
    }),

    sendcode: builder.mutation<void, any>({
      query: (payload) => ({
        url: "/auth/password/code/send/",
        method: "POST",
        data: payload,
      }),
    }),
    verifycode: builder.mutation<void, any>({
      query: (payload) => ({
        url: "/auth/password/code/verify/",
        method: "POST",
        data: payload,
      }),
    }),

    resetpassword: builder.mutation<void, any>({
      query: (payload) => ({
        url: "/auth/password/reset/", // ← ОК
        method: "POST",
        data: payload,
      }),
    }),
  }),
});
