import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Currency = { code: string; name: string; flag: string };

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Preselected currency codes (e.g., ["USD","EUR"]) */
  value?: string[];
  /** Called with final selection when the user taps "Сохранить" */
  onConfirm: (selected: string[]) => void;
  /** Optional override list */
  items?: Currency[];
}

const ORANGE = "#F58220";

const DEFAULT_ITEMS: Currency[] = [
  { code: "USD", name: "Доллар США", flag: "🇺🇸" },
  { code: "RUB", name: "Российский рубль", flag: "🇷🇺" },
  { code: "EUR", name: "Евро", flag: "🇪🇺" },
  { code: "GBP", name: "Фунт стерлингов", flag: "🇬🇧" },
  { code: "CNY", name: "Китайский юань", flag: "🇨🇳" },
  { code: "KZT", name: "Казахстанский тенге", flag: "🇰🇿" },
];

export default function CurrenciesModal({
  visible,
  onClose,
  onConfirm,
  value = ["USD", "RUB", "EUR"],
  items = DEFAULT_ITEMS,
}: Props) {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(value));

  useEffect(() => {
    if (visible) setSelected(new Set(value));
  }, [visible, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
    );
  }, [items, query]);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSave = () => onConfirm(Array.from(selected));

  const renderItem = ({ item }: { item: Currency }) => {
    const on = selected.has(item.code);
    return (
      <View style={styles.row}>
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        {/* Custom orange switch */}
        <Pressable
          onPress={() => toggle(item.code)}
          hitSlop={10}
          style={[styles.switchTrack, on ? styles.trackOn : styles.trackOff]}
        >
          <View
            style={[styles.switchThumb, on ? styles.thumbOn : styles.thumbOff]}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={250}
      animationOutTiming={250}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Валюта на главном табло</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={18}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск по названию валюты"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.code}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Sticky save button */}
          <View
            style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}
          >
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: "90%",
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E9ECEF",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  flag: { fontSize: 24, marginRight: 10 },
  code: { fontSize: 18, fontWeight: "800", color: "#111827" },
  name: { fontSize: 15, color: "#6B7280", marginTop: 2 },

  sep: { height: 1, backgroundColor: "#ECECEC" },

  // Custom switch
  switchTrack: {
    width: 62,
    height: 32,
    borderRadius: 16,
    padding: 3,
    marginLeft: 12,
    justifyContent: "center",
  },
  trackOn: { backgroundColor: ORANGE },
  trackOff: { backgroundColor: "#6B6B6B" },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "transparent",
  },
  saveBtn: {
    backgroundColor: ORANGE,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
