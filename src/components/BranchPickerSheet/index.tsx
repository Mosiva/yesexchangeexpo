import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
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

type Branch = {
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
};

type Props = {
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onCloseDetails: () => void;
  allBranches?: Branch[];
  nearestBranch?: Branch | null;
};

export default function BranchPickerSheet({
  selectedBranch,
  onSelectBranch,
  onCloseDetails,
  allBranches = [],
  nearestBranch = null,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "85%"], []);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"nearby" | "all">("nearby");

  /** 🔍 Фильтрация по поиску */
  const filteredAll = allBranches.filter(
    (b) =>
      b.address?.toLowerCase().includes(query.toLowerCase()) ||
      b.city?.toLowerCase().includes(query.toLowerCase())
  );

  const dataToShow =
    tab === "nearby" ? (nearestBranch ? [nearestBranch] : []) : filteredAll;

  const renderBranchItem = ({ item }: { item: Branch }) => (
    <Pressable
      style={styles.item}
      onPress={() => {
        onSelectBranch({
          ...item,
          worktimeToday: "Закрыто до 10:00",
          schedule: { "Пн-Пт": "10:00 - 21:00", "Сб-Вс": "10:00 - 18:00" },
          phone: item.contactPhone ?? "+7 777 000 0000",
          email: "info@yesx.kz",
        });
      }}
    >
      <View style={styles.pin}>
        <Ionicons name="logo-yen" size={14} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.city || "Филиал"}</Text>
        <Text style={styles.itemAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={SUB} />
          <Text style={styles.itemTime}>пн-вск: 8:00–21:00</Text>
        </View>
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
            {/* --- СПИСОК ФИЛИАЛОВ --- */}
            <Text style={styles.sheetTitle}>
              Выберите офис, в который хотите{"\n"}оставить заявку
            </Text>

            {/* Поиск */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск"
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

            {/* Список */}
            <FlatList
              data={dataToShow?.filter(Boolean) ?? []}
              keyExtractor={(b, i) => (b?.id ? String(b.id) : String(i))}
              renderItem={renderBranchItem}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", color: SUB, marginTop: 20 }}
                >
                  Нет филиалов
                </Text>
              }
            />
          </>
        ) : (
          <>
            {/* --- ДЕТАЛИ ФИЛИАЛА --- */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {selectedBranch.city || "Филиал"}
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

            {/* Контакты */}
            <Text style={styles.workLabel}>Контакты</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={18} color={ORANGE} />
              <Text style={styles.contactText}>
                {selectedBranch.contactPhone || "+7 777 000 0000"}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={18} color={ORANGE} />
              <Text style={styles.contactText}>info@yesx.kz</Text>
            </View>

            {/* CTA */}
            <Pressable
              style={styles.cta}
              onPress={() =>
                router.push({
                  pathname: "/(stacks)/norates/moderation",
                  params: {
                    id: String(selectedBranch.id),
                    address: selectedBranch.address,
                    kind: "Без привязки к курсу",
                    amount: "1000",
                    currency: "USD",
                    rateText: "1 KZT = 0,001861123 USD",
                  },
                })
              }
            >
              <Text style={styles.ctaText}>Забронировать тут</Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 60,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
  },
  content: { flex: 1, padding: 16 },
  sheetTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  itemTitle: { color: TEXT, fontSize: 18, fontWeight: "800" },
  itemAddress: { color: SUB, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  itemTime: { color: SUB },
  sep: { height: 1, backgroundColor: BORDER },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: TEXT },
  address: { color: SUB, marginTop: 4 },
  galleryRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  galleryItem: {
    flex: 1,
    height: 60,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  workLabel: { color: SUB, fontSize: 14, marginTop: 12, marginBottom: 4 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
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
});
