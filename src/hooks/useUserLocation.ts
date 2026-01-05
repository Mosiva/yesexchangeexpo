import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "USER_LAST_LOCATION";

export function useUserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const [address, setAddress] = useState<string>("Не определено");
  const [loading, setLoading] = useState(false);

  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);

  const permissionDenied = permissionStatus === "denied";

  /* ------------------------------------------------------------------ */
  /* 💾 Загрузка последней сохранённой локации (БЕЗ permission UI) */
  /* ------------------------------------------------------------------ */
  const loadLastLocation = useCallback(async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));

      const [reverse] = await Location.reverseGeocodeAsync(current.coords);

      if (reverse) {
        const city = reverse.city ?? reverse.region ?? "";
        const street = reverse.street ?? "";

        setAddress(
          city || street
            ? `${city}${street ? `, ${street}` : ""}`
            : "Не определено"
        );
      }
    } catch (e) {
      console.error("❌ loadLastLocation error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* ⚙️ Открыть настройки приложения */
  /* ------------------------------------------------------------------ */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 🟥 MAIN: запрос геолокации С permission UI */
  /* ------------------------------------------------------------------ */
  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      setPermissionStatus(status);

      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));

      const [reverse] = await Location.reverseGeocodeAsync(current.coords);

      if (reverse) {
        const city = reverse.city ?? reverse.region ?? "";
        const street = reverse.street ?? "";

        setAddress(
          city || street
            ? `${city}${street ? `, ${street}` : ""}`
            : "Не определено"
        );
      }
    } catch (e) {
      console.error("❌ requestLocation error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* 🟢 NEARBY: тихая попытка получить координаты (БЕЗ permission UI) */
  /* ------------------------------------------------------------------ */
  const tryGetLocation = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      setPermissionStatus(status);

      if (status !== "granted") return false;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return true;
    } catch {
      return false;
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* 🚀 Автоинициализация (БЕЗ permission UI) */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    loadLastLocation();
    tryGetLocation(); // безопасно, без системного диалога
  }, [loadLastLocation, tryGetLocation]);

  /* ------------------------------------------------------------------ */
  return {
    location,
    address,
    loading,

    permissionDenied,
    permissionStatus,

    // 🔑 API
    requestLocation, // 👉 Main / кнопка
    tryGetLocation, // 👉 Nearby
    openSettings,
  };
}
