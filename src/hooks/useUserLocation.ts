import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "USER_LAST_LOCATION";

export function useUserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("Не определено");
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

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

  /** 📍 Основной запрос локации (с UI) */
  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
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

  /** 🔄 Тихое обновление (без UI) — повышает точность */
  const silentRefresh = useCallback(async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(current); // обновляем quietly
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
    } catch (_) {
      /* Тихо игнорируем */
    }
  }, []);

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
    requestLocation, // кнопка "Обновить"
  };
}
