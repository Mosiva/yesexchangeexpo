import { AxiosRequestConfig } from "axios";
import { restApi } from "../api";
import { Notification, StandardResponse } from "@/types";

export interface CreateNotificationData {
  notification_ids: number[];
}
export interface NotificationCount {
  count: number;
}

export const notificationsApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      Notification,
      AxiosRequestConfig<Notification>
    >({
      query: (config) => ({ url: "/users/notifications", ...config }),
      providesTags: ["Notifications"],
    }),
    createIsReadNotification: builder.mutation<
      { success: boolean },
      CreateNotificationData
    >({
      query: (notification) => ({
        url: "/notifications/is_read/",
        method: "POST",
        data: notification,
      }),
      invalidatesTags: ["Notifications"],
    }),
    getNotificationListCount: builder.query<
      Notification,
      AxiosRequestConfig<NotificationCount>
    >({
      query: (config) => ({ url: "/notifications/count/", ...config }),
      providesTags: ["Notifications"],
    }),
    getNotification: builder.query<
      Notification,
      { id: Notification["id"]; config?: AxiosRequestConfig<Notification> }
    >({
      query: ({ id, config }) => ({
        url: `/users/notifications/${id}`,
        ...config,
      }),
      transformResponse: (response: StandardResponse<Notification>) =>
        response.data,
      providesTags: ["Notifications"],
    }),
  }),
});
