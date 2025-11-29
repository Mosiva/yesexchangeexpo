import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useTheme } from "../../hooks/useTheme";
import { CurrencyCode, CurrencyDto } from "../../types/api";
import CurrencyFlag from "../CurrencyFlag";

type Currency = CurrencyDto & { flag?: string };

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

export default function CurrenciesModal({
  visible,
  onClose,
  onConfirm,
  value = [],
  items,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(value));

  useEffect(() => {
    if (visible) setSelected(new Set(value));
  }, [visible, value]);

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
        <View style={{ marginRight: 10 }}>
          <CurrencyFlag code={item.code as CurrencyCode} size={24} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>

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
            <Text style={styles.title}>
              {t("currenciesModal.title", "Валюта на главном табло")}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons
              name="search"
              size={18}
              color={colors.subtext}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t(
                "currenciesModal.searchPlaceholder",
                "Поиск по названию валюты"
              )}
              placeholderTextColor={colors.subtext}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>

          {/* List */}
          <FlatList
            data={items ?? []}
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
              <Text style={styles.saveText}>
                {t("currenciesModal.saveButton", "Сохранить")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    modal: { justifyContent: "flex-end", margin: 0 },
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      backgroundColor: colors.background,
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
      backgroundColor: colors.background,
      alignSelf: "center",
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: "700", color: colors.text },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },
    searchInput: { flex: 1, fontSize: 16, color: colors.text },

    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
    },
    flag: { fontSize: 24, marginRight: 10 },
    code: { fontSize: 16, fontWeight: "700", color: colors.text },
    name: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 2,
      fontWeight: "400",
    },

    sep: { height: 1, backgroundColor: colors.border },

    // Custom switch
    switchTrack: {
      width: 36,
      height: 20,
      borderRadius: 16,
      padding: 3,
      marginLeft: 12,
      justifyContent: "center",
    },
    trackOn: { backgroundColor: ORANGE },
    trackOff: { backgroundColor: "#6B6B6B" },
    switchThumb: {
      width: 16,
      height: 16,
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
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
