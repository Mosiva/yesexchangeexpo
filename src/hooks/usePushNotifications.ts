import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { useRegisterDeviceTokenMutation } from "../services/yesExchange";
import { registerForPushNotificationsAsync } from "../utils/pushNotifications";

export function usePushNotifications(isGuest: boolean) {
  const [createExpoPushTakenSend] = useRegisterDeviceTokenMutation();

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    if (isGuest) return;

    const init = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await createExpoPushTakenSend({
          pushToken: token,
          tokenType: "expo",
        });
      }
    };

    init();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        console.log("📩 Notification received:", n);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const url = response.notification.request.content.data?.url;

        if (typeof url === "string") {
          await Linking.openURL(url);
          await Notifications.clearLastNotificationResponseAsync(); // ✅ очистка
        }
      });

    // 👇 Cold start
    const checkInitialNotification = async () => {
      const response =
        await Notifications.getLastNotificationResponseAsync();

      const url = response?.notification.request.content.data?.url;

      if (typeof url === "string") {
        await Linking.openURL(url);
        await Notifications.clearLastNotificationResponseAsync(); // ✅ очистка
      }
    };

    checkInitialNotification();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isGuest]);
}