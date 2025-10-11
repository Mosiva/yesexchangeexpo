import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#ECECEC";

/** Тип филиала */
export type Branch = {
  id: string | number;
  city?: string;
  title?: string;
  address: string;
  lat: string | number;
  lng: string | number;
  contactPhone?: string | null;
  worktimeToday?: string;
  schedule?: { [key: string]: string };
  phone?: string;
  email?: string;
  distanceKm?: number | null;
};

/** Пропсы компонента */
type Props = {
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onCloseDetails: () => void;
  allBranches?: Branch[];
  nearbyBranches?: Branch[];
  loadingLocation?: boolean;
  isRateLocked?: boolean;
};

export default function BranchPickerSheet({
  selectedBranch,
  onSelectBranch,
  onCloseDetails,
  allBranches = [],
  nearbyBranches = [],
  loadingLocation = false,
  isRateLocked = false,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "85%"], []);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"nearby" | "all">("nearby");

  // 🔎 Фильтрация
  const filteredAll = useMemo(() => {
    if (!query.trim()) return allBranches;
    return allBranches.filter((b) =>
      `${b.city ?? ""} ${b.address ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, allBranches]);

  const dataToShow = tab === "nearby" ? nearbyBranches : filteredAll;

  const renderBranchItem = ({ item }: { item: Branch }) => (
    <Pressable
      style={styles.item}
      onPress={() =>
        onSelectBranch({
          ...item,
          worktimeToday: "Закрыто до 10:00",
          schedule: { "Пн-Пт": "10:00 - 21:00", "Сб-Вс": "10:00 - 18:00" },
          email: "info@mail.com",
        })
      }
    >
      <View style={styles.pin}>
        <Image
          source={require("../../../assets/icons/LocationIcon.png")}
          style={{ width: 28, height: 28 }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>
          {item.city ?? item.title ?? "Без названия"}
        </Text>
        <Text style={styles.itemAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={SUB} />
          <Text style={styles.itemTime}>
            {"пн-пт: 8:00-21:00, вс: выходной"}
          </Text>
        </View>
        {item.distanceKm != null && (
          <Text style={styles.itemDistance}>
            {item.distanceKm.toFixed(1)} км от вас
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C9CF" />
    </Pressable>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.content}>
        {!selectedBranch ? (
          <>
            <Text style={styles.sheetTitle}>Выберите офис обмена</Text>

            {/* Поиск */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск по адресу"
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>

            {/* Вкладки */}
            <View style={styles.tabs}>
              <Pressable
                onPress={() => setTab("nearby")}
                style={[styles.tab, tab === "nearby" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "nearby" && styles.tabTextActive,
                  ]}
                >
                  Рядом
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("all")}
                style={[styles.tab, tab === "all" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "all" && styles.tabTextActive,
                  ]}
                >
                  Все филиалы
                </Text>
              </Pressable>
            </View>

            {/* Список / индикатор */}
            {tab === "nearby" && loadingLocation ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="small" color={ORANGE} />
                <Text style={{ marginTop: 8, color: SUB }}>
                  Определяем местоположение...
                </Text>
              </View>
            ) : (
              <FlatList
                data={dataToShow}
                keyExtractor={(b) => String(b.id)}
                renderItem={renderBranchItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        ) : (
          <>
            {/* --- ДЕТАЛИ ФИЛИАЛА --- */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {selectedBranch.city ?? selectedBranch.title ?? "Филиал"}
                </Text>
                <Text style={styles.address}>{selectedBranch.address}</Text>
              </View>
              <Pressable onPress={onCloseDetails}>
                <Ionicons name="close" size={22} color={TEXT} />
              </Pressable>
            </View>
            {/* Галерея-заглушка */}
            <View style={styles.galleryRow}>
              <View style={styles.galleryItem} />
              <View style={styles.galleryItem} />
              <View style={styles.galleryItem} />
            </View>
            {/* Время работы */}
            <Text style={styles.workLabel}>Время работы</Text>
            <Text style={styles.workNow}>{selectedBranch.worktimeToday}</Text>

            {/* График */}
            <Text style={styles.workLabel}>График</Text>
            {selectedBranch.schedule &&
              Object.entries(selectedBranch.schedule).map(([day, hours]) => (
                <View style={styles.scheduleRow} key={day}>
                  <Text style={styles.day}>{day}</Text>
                  <Text style={styles.hours}>{hours}</Text>
                </View>
              ))}
            {/* Контакты */}
            {selectedBranch.contactPhone && (
              <>
                <Text style={styles.workLabel}>Контакты</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={18} color={ORANGE} />
                  <Text style={styles.contactText}>
                    {selectedBranch.contactPhone}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="mail" size={18} color={ORANGE} />
                  <Text style={styles.contactText}>info@yesx.kz</Text>
                </View>
              </>
            )}

            {/* CTA */}
            <Pressable
              style={styles.cta}
              onPress={() =>
                router.push({
                  pathname: isRateLocked
                    ? "/(stacks)/norates/withrates"
                    : "/(stacks)/norates",
                  params: {
                    id: selectedBranch.id,
                    address: selectedBranch.address,
                    city: selectedBranch.city,
                  },
                })
              }
            >
              <Text style={styles.ctaText}>
                {isRateLocked ? "Забронировать по курсу" : "Забронировать тут"}
              </Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

/* 💅 Стили */
const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: { width: 60, height: 4, backgroundColor: "#E9ECEF", borderRadius: 2 },
  content: { flex: 1, padding: 16 },
  sheetTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: TEXT },
  tabs: { flexDirection: "row", gap: 12, marginBottom: 10 },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F6F8",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#F0F1F3" },
  tabText: { color: SUB, fontSize: 16, fontWeight: "700" },
  tabTextActive: { color: TEXT },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  pin: {
    marginRight: 10,
  },
  itemTitle: { color: TEXT, fontSize: 18, fontWeight: "800" },
  itemAddress: { color: SUB, marginTop: 4 },
  itemDistance: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  sep: { height: 1, backgroundColor: BORDER },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: TEXT },
  address: { color: SUB, marginTop: 4 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  workLabel: { color: SUB, fontSize: 14, marginTop: 12, marginBottom: 4 },
  contactText: { color: TEXT, fontSize: 16 },
  cta: {
    marginTop: 20,
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  galleryRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  galleryItem: {
    flex: 1,
    height: 60,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  workNow: { color: "red", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  scheduleRow: { flexDirection: "row", justifyContent: "space-between" },
  day: { fontWeight: "700", color: TEXT },
  hours: { color: TEXT },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  itemTime: { color: SUB },
});
