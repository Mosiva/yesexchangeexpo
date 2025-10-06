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

  /** 💾 загрузка сохранённой позиции */
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
      console.warn("⚠️ Не удалось загрузить последнюю локацию", e);
    }
  }, []);

  /** 📍 запрос текущей позиции */
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
      } else {
        setAddress("Не определено");
      }
    } catch (e) {
      console.error("Ошибка при получении геолокации:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 🚀 автоинициализация при монтировании */
  useEffect(() => {
    (async () => {
      await loadLastLocation();
      await requestLocation();

      // 🔁 через секунду повторно обновляем для надёжности
      setTimeout(() => {
        requestLocation();
      }, 1000);
    })();
  }, [loadLastLocation, requestLocation]);

  return {
    location,
    address,
    loading,
    permissionDenied,
    requestLocation,
  };
}
