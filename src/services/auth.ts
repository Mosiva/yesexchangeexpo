import { restApi } from "../api";
import { Auth, Cridentials, User } from "@/types";
import { RegisterData } from "@/types/auth";

export const authApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<Auth, Cridentials>({
      query: (cridentials) => ({
        url: "/auth/login",
        method: "POST",
        data: cridentials,
      }),
    }),

    register: builder.mutation<User, RegisterData>({
      query: (cridentials) => ({
        url: "/auth/register",
        method: "POST",
        data: cridentials,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    verifycode: builder.mutation<void, void>({
      query: (cridentials) => ({
        url: "/auth/send-reset-code",
        method: "POST",
        data: cridentials,
      }),
    }),
    resetpassword: builder.mutation<void, void>({
      query: (cridentials) => ({
        url: "/auth/reset-password",
        method: "POST",
        data: cridentials,
      }),
    }),
  }),
});
