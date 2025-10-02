import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BranchPickerSheet from "../../../../components/BranchPickerSheet ";
const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";

export default function BranchPickerScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* TopBar поверх */}
      <View style={styles.topBarWrapper}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={TEXT} />
          </Pressable>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={ORANGE} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.myAddrLabel}>Мой адрес</Text>
              <Text style={styles.myAddrValue}>Астана, Аэропорт</Text>
            </View>
          </View>
          <Pressable
            style={styles.refreshBtn}
            onPress={() => console.log("refresh location")}
          >
            <Text style={styles.refreshText}>Обновить</Text>
          </Pressable>
        </View>
      </View>

      {/* Карта */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 51.1694, // центр Астаны
          longitude: 71.4491,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: 51.1694, longitude: 71.4491 }}
          title="Yes Exchange NN Airport"
          description="Астана, ул. Шарля де Голля, 8"
        />
        <Marker
          coordinate={{ latitude: 51.18, longitude: 71.46 }}
          title="Yes Exchange City Center"
          description="Астана, пр. Абая, 12"
        />
      </MapView>

      <BranchPickerSheet />
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
