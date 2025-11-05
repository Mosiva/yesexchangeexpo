import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Уведомление",
    body: "Подключено!",
    data: { someData: "тест" },
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();

  if (data?.data?.[0]?.status === "error") {
    if (data.data[0].details.error === "DeviceNotRegistered") {
      console.warn("⚠️ Device not registered:", expoPushToken);
    }
  }
}

function handleRegistrationError(message: string) {
  Alert.alert("Ошибка", message);
  throw new Error(message);
}

/**
 * Регистрирует устройство и возвращает Expo Push Token.
 * Автоматически запрашивает разрешения и создаёт канал для Android.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError(
      "Только физическое устройство поддерживает push-уведомления"
    );
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    handleRegistrationError("Разрешение на уведомления не предоставлено");
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError("Project ID не найден");
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    console.log("📱 Expo push token:", token);
    return token;
  } catch (e: any) {
    handleRegistrationError(e.message);
    return null;
  }
}
