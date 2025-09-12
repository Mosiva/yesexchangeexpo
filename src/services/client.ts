import { AxiosRequestConfig } from "axios";

import { restApi } from "../api";
import { Client, UpdateClientData } from "@/types";

export const clientApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getClient: builder.query<Client, AxiosRequestConfig<Client>>({
      query: (config) => ({ url: "user/me", ...config }),
      providesTags: ["Client"],
    }),
    updateClient: builder.mutation<Client, UpdateClientData>({
      query: (client) => ({
        url: "/clients/" + client.id,
        method: "PUT",
        data: client,
      }),
      invalidatesTags: ["Client"],
    }),
    updateClientPassword: builder.mutation<Client, UpdateClientData>({
      query: (client) => ({
        url: "auth/change-password",
        method: "POST",
        data: client,
      }),
      invalidatesTags: ["Client"],
    }),
    getClientActivePrograms: builder.query<Client, AxiosRequestConfig<Client>>({
      query: (config) => ({ url: "user/active-programs", ...config }),
      providesTags: ["Client"],
    }),
    deleteClient: builder.mutation<Client, AxiosRequestConfig<Client>>({
      query: (config) => ({
        url: "/profile/delete",
        method: "DELETE",
        ...config,
      }),
      invalidatesTags: ["Client"],
    }),
    createExpoPushTakenSend: builder.mutation<
      { success: boolean },
      { expo_token: string }
    >({
      query: (body) => ({
        url: "/users/push-token",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Client"],
    }),
  }),
});
