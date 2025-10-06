import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";

export function useUserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("Не определено");
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        Alert.alert(
          "Доступ к геолокации запрещён",
          "Разрешите доступ к местоположению в настройках устройства.",
          [
            { text: "Отмена", style: "cancel" },
            {
              text: "Открыть настройки",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(current);

      const [reverse] = await Location.reverseGeocodeAsync(current.coords);
      if (reverse && (reverse.city || reverse.region)) {
        setAddress(
          `${reverse.city ?? reverse.region}, ${reverse.street ?? ""}`
        );
      } else {
        setAddress("Адрес не определён");
      }
    } catch (e) {
      console.error("Ошибка геолокации:", e);
      Alert.alert("Ошибка", "Не удалось определить местоположение.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    address,
    loading,
    permissionDenied,
    requestLocation,
  };
}
