import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { getDistance } from "geolib";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BranchPickerSheet from "../../../../components/BranchPickerSheet";
import { useTheme } from "../../../../hooks/useTheme";
import { useUserLocation } from "../../../../hooks/useUserLocation";
import {
  useBranchesQuery,
  useNearestBranchesQuery,
} from "../../../../services/yesExchange";
import { darkMapStyle } from "../../../../theme/mapStyles";

export default function BranchPickerScreen() {
  const { t } = useTranslation();
  const p = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const s = makeStyles(colors);

  const isRateLocked = p.isRateLocked === "true";

  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [branchesWithDistance, setBranchesWithDistance] = useState<any[]>([]);
  const mapRef = useRef<MapView | null>(null);

  /** 🧭 Геолокация */
  const {
    location,
    address,
    loading: loadingLocation,
    permissionDenied,
    requestLocation,
    openSettings,
  } = useUserLocation();

  /** 🔗 API */
  const { data: rawBranches, refetch: refetchBranches } = useBranchesQuery();
  const { refetch: refetchNearestBranches } = useNearestBranchesQuery({
    lng: location?.coords.longitude ?? 0,
    lat: location?.coords.latitude ?? 0,
  });

  const [showPermissionOverlay, setShowPermissionOverlay] = useState(true);
  useEffect(() => {
    if (permissionDenied) {
      setShowPermissionOverlay(true);
    }
  }, [permissionDenied]);

  const branches = useMemo(
    () => (Array.isArray(rawBranches) ? rawBranches : []),
    [rawBranches]
  );

  /** 🔄 Рефетч */
  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchBranches(), refetchNearestBranches()]);
  }, [refetchBranches, refetchNearestBranches]);

  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  /** 📏 Расстояние */
  const computeDistances = useCallback(() => {
    // ⛔ нет геолокации — просто показываем все филиалы
    if (!location && branches.length) {
      setBranchesWithDistance(
        branches.map((b) => ({ ...b, distanceKm: null }))
      );
      return;
    }

    if (!location || !branches.length) return;

    const computed = branches.map((branch) => {
      const lat = Number(branch.lat);
      const lng = Number(branch.lng);

      if (isNaN(lat) || isNaN(lng)) {
        return { ...branch, distanceKm: null };
      }

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
    computeDistances();
  }, [branches, location]);

  /** 30 км зона */
  const nearbyBranches = useMemo(
    () =>
      branchesWithDistance.filter(
        (b) => b.distanceKm !== null && b.distanceKm <= 30
      ),
    [branchesWithDistance]
  );

  /** 🎯 UI анимация */
  const markerScale = useRef(new Animated.Value(1)).current;

  const triggerBounce = () => {
    markerScale.setValue(1);
    Animated.sequence([
      Animated.timing(markerScale, {
        toValue: 1.3,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(markerScale, {
        toValue: 1,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectBranch = (branch: any) => {
    setSelectedBranch(branch);
    triggerBounce();

    if (branch.lat && branch.lng && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(branch.lat),
          longitude: Number(branch.lng),
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600
      );
    }
  };

  return (
    <View style={[s.container]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Топ бар */}
      <View style={s.topBarWrapper}>
        <View style={s.topBar}>
          <Pressable onPress={() => router.replace("/(tabs)/reserve")}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={s.addressRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={s.myAddrLabel}>
                {t("nearby.myAddress", "Моё местоположение")}
              </Text>
              <Text style={s.myAddrValue}>
                {loadingLocation
                  ? t("nearby.loading", "Определяем...")
                  : permissionDenied
                  ? t("nearby.permissionDenied", "Доступ запрещён")
                  : address}
              </Text>
            </View>
          </View>
          <Pressable
            style={s.refreshBtn}
            onPress={() => {
              if (permissionDenied) {
                // если ранее закрыли — снова показываем overlay
                setShowPermissionOverlay(true);
              } else {
                requestLocation();
              }
            }}
          >
            <Text style={s.refreshText}>{t("nearby.refresh", "Обновить")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Карта */}
      <MapView
        ref={mapRef}
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
        customMapStyle={
          Platform.OS === "android" && theme === "dark" ? darkMapStyle : []
        }
      >
        {branchesWithDistance.map((branch) => {
          const isSelected = selectedBranch?.id === branch.id;
          if (isNaN(Number(branch.lat)) || isNaN(Number(branch.lng)))
            return null;

          return (
            <Marker
              key={branch.id}
              coordinate={{
                latitude: Number(branch.lat),
                longitude: Number(branch.lng),
              }}
              title={branch.city}
              description={branch.address}
              onPress={() => handleSelectBranch(branch)}
            >
              <Animated.View
                style={{
                  transform: [{ scale: isSelected ? markerScale : 1 }],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: isSelected ? 28 : 22,
                    height: isSelected ? 28 : 22,
                    backgroundColor: isSelected ? "transparent" : colors.card,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../../../../../assets/icons/LocationIcon.png")}
                    style={{ width: 28, height: 28 }}
                  />
                </View>
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      {/* Шторка */}
      <BranchPickerSheet
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
        onCloseDetails={() => setSelectedBranch(null)}
        allBranches={branchesWithDistance}
        nearbyBranches={nearbyBranches}
        loadingLocation={loadingLocation}
        isRateLocked={isRateLocked}
      />

      {/* ==== PERMISSION OVERLAY ==== */}
      {permissionDenied && showPermissionOverlay && (
        <View style={s.permissionOverlay}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.primary}
          />

          <Text style={s.permissionTitle}>
            {t("nearby.locationDisabled", "Геолокация отключена")}
          </Text>

          <Text style={s.permissionDesc}>
            {t(
              "nearby.locationPermissionDescription",
              "Разрешите доступ к геолокации в настройках, чтобы увидеть ближайшие филиалы"
            )}
          </Text>

          {/* Открыть настройки */}
          <Pressable style={s.retryBtn} onPress={openSettings}>
            <Text style={s.retryText}>
              {t("nearby.openSettings", "Открыть настройки")}
            </Text>
          </Pressable>

          {/* Закрыть */}
          <Pressable
            style={[
              s.retryBtn,
              { backgroundColor: "transparent", marginTop: 8 },
            ]}
            onPress={() => setShowPermissionOverlay(false)}
          >
            <Text style={[s.retryText, { color: colors.subtext }]}>
              {t("common.close", "Закрыть")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ----------------------------- THEME STYLES ----------------------------- */

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBarWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      backgroundColor: colors.card,
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
    myAddrLabel: {
      color: colors.subtext,
      fontSize: 12,
      marginBottom: 2,
    },
    myAddrValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    refreshBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    refreshText: {
      color: "#fff",
      fontWeight: "700",
    },
    permissionOverlay: {
      position: "absolute",
      top: "30%",
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    permissionTitle: {
      marginTop: 12,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    permissionDesc: {
      marginTop: 8,
      color: colors.subtext,
      textAlign: "center",
    },
    retryBtn: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryText: {
      color: "#fff",
      fontWeight: "700",
    },
  });
