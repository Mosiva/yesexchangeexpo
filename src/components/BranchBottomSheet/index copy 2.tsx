import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
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
  id: string;
  title: string;
  address: string;
  worktime: string;
  distanceKm?: number;
};

const BRANCHES: Branch[] = [
  {
    id: "1",
    title: "Yes Exchange NN Airport",
    address: "Астана, ул. Шарля де Голля, 8",
    worktime: "пн-пт: 8:00-21:00, вс: выходной",
    distanceKm: 1.2,
  },
  {
    id: "2",
    title: "Yes Exchange NN Airport",
    address: "Астана, ул. Шарля де Голля, 8",
    worktime: "пн-вск: 8:00-21:00",
    distanceKm: 3.7,
  },
  {
    id: "3",
    title: "Yes Exchange NN Airport",
    address: "Астана, ул. Шарля де Голля, 8",
    worktime: "пн-вск: 8:00-21:00",
    distanceKm: 6.1,
  },
];

export default function BranchBottomSheet({
  onSelectBranch,
}: {
  onSelectBranch: (branch: any) => void;
}) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "85%"], []);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"nearby" | "all">("nearby");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = BRANCHES.slice();
    if (tab === "nearby") {
      list.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
    );
  }, [query, tab]);
  const handlePressBranch = (item: Branch) => {
    sheetRef.current?.close(); // закрываем список
    onSelectBranch({
      ...item,
      worktimeToday: "Закрыто до 10:00",
      schedule: { "Пн-Пт": "10:00 - 21:00", "Сб-Вс": "10:00 - 18:00" },
      phone: "+998 586 66 66 577",
      email: "info@mail.com",
    });
  };

  const renderItem = ({ item }: { item: Branch }) => (
    <Pressable style={styles.item} onPress={() => handlePressBranch(item)}>
      <View style={styles.pin}>
        <Ionicons name="logo-yen" size={14} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={SUB} />
          <Text style={styles.itemTime}>{item.worktime}</Text>
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
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.sheetBg}
      backdropComponent={(p) => (
        <BottomSheetBackdrop
          {...p}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
          pressBehavior="none"
          style={{ top: 120 }}
        />
      )}
    >
      <BottomSheetView style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>
          Выберите офис, в который хотите{"\n"}оставить заявку
        </Text>

        {/* Search */}
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

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("nearby")}
            style={[styles.tab, tab === "nearby" && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === "nearby" && styles.tabTextActive]}
            >
              Рядом
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("all")}
            style={[styles.tab, tab === "all" && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === "all" && styles.tabTextActive]}
            >
              Все филиалы
            </Text>
          </Pressable>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    width: 60,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
  },
  sheetContent: { paddingHorizontal: 16, paddingTop: 8 },
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTitle: { color: TEXT, fontSize: 18, fontWeight: "800" },
  itemAddress: { color: SUB, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  itemTime: { color: SUB },
  sep: { height: 1, backgroundColor: BORDER },
});
