import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BranchPickerSheet from "../../../../components/BranchPickerSheet";
import {
  useBranchesQuery,
  useNearestBranchesQuery,
} from "../../../../services/yesExchange";

const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";

const BRANCHES = [
  {
    id: "1",
    title: "Yes Exchange NN Airport",
    address: "Астана, ул. Шарля де Голля, 8",
    worktime: "пн-пт: 8:00-21:00, вс: выходной",
    latitude: 51.026821,
    longitude: 71.46085,
  },
  {
    id: "2",
    title: "Yes Exchange City Center",
    address: "Астана, пр. Абая, 12",
    worktime: "пн-вск: 8:00-21:00",
    latitude: 51.18,
    longitude: 71.46,
  },
];

export default function BranchPickerScreen() {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("Не определено");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const {
    data: rawBranches,
    refetch: refetchBranches,
    isLoading: isBranchesLoading,
    isError: isBranchesError,
  } = useBranchesQuery({});

  const branches = rawBranches?.data ?? [];

  const {
    data: rawNearestBranches,
    refetch: refetchNearestBranches,
    isLoading: isNearestBranchesLoading,
    isError: isNearestBranchesError,
  } = useNearestBranchesQuery({
    lng: location?.coords.longitude ?? 0,
    lat: location?.coords.latitude ?? 0,
  });
  const nearestBranch = rawNearestBranches ?? null;
  // Refetch all data function
  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchBranches(), refetchNearestBranches()]);
  }, [refetchBranches, refetchNearestBranches]);

  // Refetch data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  /** 🧭 Запросить разрешение и получить текущее местоположение */
  const requestLocation = async () => {
    try {
      setLoadingLocation(true);

      // 1️⃣ Проверяем разрешение
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // Пользователь отказал или отключил геолокацию в настройках
        Alert.alert(
          "Доступ к геолокации запрещён",
          "Разрешите доступ к геолокации в настройках устройства, чтобы приложение могло определить ваше местоположение.",
          [
            {
              text: "Отмена",
              style: "cancel",
            },
            {
              text: "Открыть настройки",
              onPress: async () => {
                try {
                  await Linking.openSettings();
                } catch (err) {
                  console.error("Не удалось открыть настройки:", err);
                  Alert.alert(
                    "Ошибка",
                    "Не удалось открыть настройки устройства."
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // 2️⃣ Получаем координаты
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(current);

      // 3️⃣ Преобразуем в адрес
      const [reverse] = await Location.reverseGeocodeAsync(current.coords);
      if (reverse) {
        setAddress(
          `${reverse.city ?? reverse.region ?? ""}, ${reverse.street ?? ""}`
        );
      } else {
        setAddress("Не определено");
      }
    } catch (error) {
      console.error("Ошибка определения локации:", error);
      Alert.alert("Ошибка", "Не удалось определить ваше местоположение.");
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    requestLocation(); // автоматически при открытии
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* TopBar */}
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBarWrapper}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </Pressable>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={ORANGE} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.myAddrLabel}>Моё местоположение</Text>
              <Text style={styles.myAddrValue}>
                {loadingLocation ? "Определяем..." : address}
              </Text>
            </View>
          </View>

          <Pressable style={styles.refreshBtn} onPress={requestLocation}>
            <Text style={styles.refreshText}>Обновить</Text>
          </Pressable>
        </View>
      </View>

      {/* Карта */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.coords.latitude ?? 51.1694,
          longitude: location?.coords.longitude ?? 71.4491,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
      >
        {BRANCHES.map((branch) => (
          <Marker
            key={branch.id}
            coordinate={{
              latitude: branch.latitude,
              longitude: branch.longitude,
            }}
            title={branch.title}
            description={branch.address}
            onPress={() => setSelectedBranch(branch)}
          />
        ))}
      </MapView>

      {/* Шторка с филиалами */}
      <BranchPickerSheet
        selectedBranch={selectedBranch}
        onSelectBranch={(branch: any) => setSelectedBranch(branch)}
        onCloseDetails={() => setSelectedBranch(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBarWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 6,
    justifyContent: "space-between",
  },
  addressRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  myAddrLabel: { color: SUB, fontSize: 12, marginBottom: 2 },
  myAddrValue: { color: TEXT, fontSize: 16, fontWeight: "700" },
  refreshBtn: {
    backgroundColor: "#2B2B2B",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: { color: "#fff", fontWeight: "700" },
});
