import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotifPrefs = {
  rates: boolean; // Курсы валют
  finance: boolean; // Финансовые новости
  yesNews: boolean; // YesNews
};

interface Props {
  visible: boolean;
  value?: NotifPrefs; // preselected values
  onClose: () => void;
  onConfirm: (next: NotifPrefs) => void; // called on save
}

const ORANGE = "#F58220";

export default function NotificationsModal({
  visible,
  value = { rates: true, finance: true, yesNews: false },
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
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
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Уведомления</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Rows */}
          <Row
            label="Курсы валют"
            value={prefs.rates}
            onToggle={() => toggle("rates")}
          />
          <Separator />
          <Row
            label="Финансовые новости"
            value={prefs.finance}
            onToggle={() => toggle("finance")}
          />
          <Separator />
          <Row
            label="YesNews"
            value={prefs.yesNews}
            onToggle={() => toggle("yesNews")}
          />

          {/* Sticky Save */}
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

/** One setting row */
function Row({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={rowStyles.wrap}>
      <Text style={rowStyles.label}>{label}</Text>

      {/* Custom pill switch */}
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={[
          rowStyles.track,
          value ? rowStyles.trackOn : rowStyles.trackOff,
        ]}
      >
        <View
          style={[
            rowStyles.thumb,
            value ? rowStyles.thumbOn : rowStyles.thumbOff,
          ]}
        />
      </Pressable>
    </View>
  );
}

function Separator() {
  return <View style={styles.sep} />;
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
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },

  sep: { height: 1, backgroundColor: "#ECECEC", marginLeft: 0, marginRight: 0 },

  bottomBar: {
    marginTop: 16,
    left: 16,
    right: 16,
    bottom: 0,
  },
  saveBtn: {
    backgroundColor: ORANGE,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  label: { fontSize: 22, fontWeight: "800", color: "#111827" },

  // switch styles
  track: {
    width: 62,
    height: 32,
    borderRadius: 16,
    padding: 3,
    justifyContent: "center",
  },
  trackOn: { backgroundColor: ORANGE },
  trackOff: { backgroundColor: "#6B6B6B" },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },
});
