import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { clientApi } from "services";
import { registerForPushNotificationsAsync } from "../utils/pushNotifications";

const { useCreateExpoPushTakenSendMutation } = clientApi;

/**
 * Хук, который:
 * - регистрирует push token
 * - отправляет его на backend
 * - слушает входящие уведомления
 */
export function usePushNotifications() {
  const [createExpoPushTakenSend] = useCreateExpoPushTakenSendMutation();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await createExpoPushTakenSend({ expo_token: token });
      }
    };
    init();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("📨 Notification tapped:", response);
      });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
