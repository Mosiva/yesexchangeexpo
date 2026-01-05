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

  /** 💾 Загрузка последней сохранённой локации */
  const loadLastLocation = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.coords) {
          setLocation(parsed);
        }
      }
    } catch (e) {
      console.warn("⚠️ Не удалось загрузить сохранённую локацию", e);
    }
  }, []);

  /** ⚙️ Открыть настройки */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  /** 📍 Запрос геолокации (ТОЛЬКО по кнопке / с Main) */
  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      setPermissionStatus(status);

      if (status !== "granted") {
        return;
      }

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
      console.error("Ошибка получения геолокации:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🔄 Тихое обновление (без permission UI) */
  const silentRefresh = useCallback(async () => {
    if (permissionStatus !== "granted") return;

    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      /* ignore */
    }
  }, [permissionStatus]);

  /** 🚀 Автоинициализация */
  useEffect(() => {
    (async () => {
      await loadLastLocation();
      await requestLocation(); // один раз — с UI

      // через 1.5 сек. — тихая корректировка (без мерцания)
      setTimeout(() => {
        silentRefresh();
      }, 1500);
    })();
  }, [loadLastLocation, requestLocation, silentRefresh]);

  return {
    location,
    address,
    loading,

    permissionDenied,
    permissionStatus,

    requestLocation, // 👉 вызывается ТОЛЬКО на Main или по кнопке
    openSettings,
    silentRefresh,
  };
}
