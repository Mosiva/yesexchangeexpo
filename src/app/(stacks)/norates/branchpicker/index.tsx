import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getDistance } from "geolib";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

export default function BranchPickerScreen() {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("Не определено");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [branchesWithDistance, setBranchesWithDistance] = useState<any[]>([]);

  const {
    data: rawBranches,
    refetch: refetchBranches,
    isLoading: isBranchesLoading,
  } = useBranchesQuery({});

  const branches = rawBranches?.data ?? [];

  const { refetch: refetchNearestBranches } = useNearestBranchesQuery({
    lng: location?.coords.longitude ?? 0,
    lat: location?.coords.latitude ?? 0,
  });

  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchBranches(), refetchNearestBranches()]);
  }, [refetchBranches, refetchNearestBranches]);

  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  /** 📍 Запросить разрешение и определить местоположение */
  const requestLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Доступ к геолокации запрещён",
          "Разрешите доступ к геолокации в настройках устройства.",
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
      if (reverse) {
        setAddress(
          `${reverse.city ?? reverse.region ?? ""}, ${reverse.street ?? ""}`
        );
      }
    } catch (e) {
      console.error("Ошибка геолокации:", e);
    } finally {
      setLoadingLocation(false);
    }
  };

  /** 📏 Расчёт расстояний */
  const computeDistances = useCallback(() => {
    if (!location || !branches.length) return;

    const computed = branches.map((branch) => {
      const lat = Number(branch.lat);
      const lng = Number(branch.lng);
      if (isNaN(lat) || isNaN(lng)) return { ...branch, distanceKm: null };

      const distanceMeters = getDistance(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        { latitude: lat, longitude: lng }
      );

      return { ...branch, distanceKm: distanceMeters / 1000 };
    });

    const sorted = computed.sort(
      (a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999)
    );
    setBranchesWithDistance(sorted);
  }, [branches, location]);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    computeDistances();
  }, [branches, location]);

  /** 📍 Фильтрация ближайших филиалов (≤15 км) */
  const nearbyBranches = useMemo(() => {
    return branchesWithDistance.filter(
      (b) => b.distanceKm !== null && b.distanceKm <= 15
    );
  }, [branchesWithDistance]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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

      {/* 🗺 Карта */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.coords.latitude ?? 51.1694,
          longitude: location?.coords.longitude ?? 71.4491,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
      >
        {branchesWithDistance.map((branch) => (
          <Marker
            key={branch.id}
            coordinate={{
              latitude: Number(branch.lat),
              longitude: Number(branch.lng),
            }}
            title={branch.city}
            description={branch.address}
            onPress={() => setSelectedBranch(branch)}
          />
        ))}
      </MapView>

      <BranchPickerSheet
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        onCloseDetails={() => setSelectedBranch(null)}
        allBranches={branchesWithDistance}
        nearbyBranches={nearbyBranches}
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
