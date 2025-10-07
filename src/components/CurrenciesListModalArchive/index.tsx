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

type Currency = { code: string; name: string; flag: React.ReactNode };

interface Props {
  visible: boolean;
  onClose: () => void;
  value?: string[];
  onConfirm: (selected: string[]) => void;
  items?: Currency[];
  buttonText?: string;
}

const ORANGE = "#F58220";

export default function CurrenciesListModalArchive({
  visible,
  onClose,
  onConfirm,
  value = ["USD"],
  items,
  buttonText = "Посмотреть архив",
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
    return items?.filter(
      (i) =>
        i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
    );
  }, [items, query]);

  const choose = (code: string) => setSelected(new Set([code]));
  const handleConfirm = () => onConfirm(Array.from(selected));

  const renderItem = ({ item }: { item: Currency }) => {
    const on = selected.has(item.code);
    return (
      <Pressable style={styles.row} onPress={() => choose(item.code)}>
        {/* radio */}
        <View style={[styles.radioOuter, on && styles.radioOuterOn]}>
          {on && <View style={styles.radioInner} />}
        </View>

        {/* flag — теперь React-элемент */}
        <View style={{ marginRight: 4 }}>{item.flag}</View>

        {/* code + name */}
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </Pressable>
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
            <Text style={styles.title}>Валюта</Text>
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

          {/* Bottom CTA */}
          <View
            style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}
          >
            <TouchableOpacity style={styles.saveBtn} onPress={handleConfirm}>
              <Text style={styles.saveText}>{buttonText}</Text>
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
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
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
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: ORANGE },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ORANGE,
  },
  code: { fontSize: 16, fontWeight: "700", color: "#111827" },
  name: { fontSize: 12, color: "#6B7280", marginTop: 2, fontWeight: "400" },
  sep: { height: 1, backgroundColor: "#ECECEC" },
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
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
