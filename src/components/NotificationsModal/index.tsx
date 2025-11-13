import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

type NotifPrefs = {
  rates: boolean;
  finance: boolean;
  yesNews: boolean;
};

interface Props {
  visible: boolean;
  value?: NotifPrefs;
  onClose: () => void;
  onConfirm: (next: NotifPrefs) => void;
}

export default function NotificationsModal({
  visible,
  value = { rates: true, finance: true, yesNews: false },
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [prefs, setPrefs] = useState<NotifPrefs>(value);
  useEffect(() => {
    if (visible) setPrefs(value);
  }, [visible, value]);

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => onConfirm(prefs);

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
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("notifications.title", "Уведомления")}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Rows */}
          <Row
            label={t("notifications.rates", "Курсы валют")}
            value={prefs.rates}
            onToggle={() => toggle("rates")}
            colors={colors}
          />
          <Separator colors={colors} />

          <Row
            label={t("notifications.finance", "Финансовые новости")}
            value={prefs.finance}
            onToggle={() => toggle("finance")}
            colors={colors}
          />
          <Separator colors={colors} />

          <Row
            label="YesNews"
            value={prefs.yesNews}
            onToggle={() => toggle("yesNews")}
            colors={colors}
          />

          {/* Save Button */}
          <View
            style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}
          >
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>{t("common.save", "Сохранить")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ----- Row Component ----- */
function Row({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
}) {
  return (
    <View style={rowStyles.wrap}>
      <Text style={[rowStyles.label, { color: colors.text }]}>{label}</Text>

      {/* Custom Switch */}
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={[
          rowStyles.track,
          {
            backgroundColor: value ? colors.primary : colors.border,
          },
        ]}
      >
        <View
          style={[
            rowStyles.thumb,
            {
              backgroundColor: colors.text,
              alignSelf: value ? "flex-end" : "flex-start",
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

function Separator({ colors }: { colors: any }) {
  return <View style={[styles.sep, { backgroundColor: colors.border }]} />;
}

/* ----- Styles ----- */
const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: "90%",
    borderWidth: 1,
  },

  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  title: { fontSize: 20, fontWeight: "700" },

  sep: {
    height: 1,
    marginLeft: 0,
    marginRight: 0,
  },

  bottomBar: { marginTop: 16 },

  saveBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

/* ----- Row styles ----- */
const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  track: {
    width: 36,
    height: 20,
    borderRadius: 16,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 13,
  },
});
