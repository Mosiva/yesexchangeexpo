import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { useRegisterDeviceTokenMutation } from "../services/yesExchange";
import { registerForPushNotificationsAsync } from "../utils/pushNotifications";

export function usePushNotifications(isGuest: boolean) {
  const [createExpoPushTakenSend] = useRegisterDeviceTokenMutation();
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  useEffect(() => {
    if (isGuest) return; // ✅ гости не регистрируются

    const init = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await createExpoPushTakenSend({ pushToken: token, tokenType: "expo" });
      }
    };
    init();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        console.log("📩 Notification received:", n);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((r) => {
        console.log("📨 Notification tapped:", r);
      });

    return () => {
      if (notificationListener.current)
        notificationListener.current.remove();
      if (responseListener.current)
        responseListener.current.remove();
    };
  }, [isGuest]); // ✅ Обязательно;
}
