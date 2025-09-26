import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

type LangCode = "kz" | "ru" | "en";

interface Props {
  visible: boolean;
  value?: LangCode; // current language (preselected)
  onClose: () => void;
  onConfirm: (next: LangCode) => void; // called with selected language
}

export default function LanguageChooseModal({
  visible,
  value = "ru",
  onClose,
  onConfirm,
}: Props) {
  const [choice, setChoice] = useState<LangCode>(value);

  // sync when opened with a new value
  useEffect(() => {
    if (visible) setChoice(value);
  }, [visible, value]);

  const options: { code: LangCode; label: string; icon: any }[] = [
    {
      code: "kz",
      label: "Казахский",
      icon: require("../../../assets/icons/kz.png"),
    },
    {
      code: "ru",
      label: "Русский",
      icon: require("../../../assets/icons/ru.png"),
    },
    {
      code: "en",
      label: "Английский",
      icon: require("../../../assets/icons/eng.png"),
    },
  ];

  const handleSave = () => onConfirm(choice);

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
        <View style={styles.content}>
          {/* Шторка */}
          <View style={styles.handle} />

          {/* Заголовок + крестик */}
          <View style={styles.header}>
            <Text style={styles.title}>Язык приложения</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={{ gap: 8 }}>
            {options.map((opt) => {
              const active = choice === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => setChoice(opt.code)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>

                  <Image source={opt.icon} style={styles.flag} />
                  <Text style={styles.rowLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E9ECEF",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowActive: { backgroundColor: "#F5F6F8" },
  rowLabel: {
    fontSize: 16,
    color: "#111827",
    marginLeft: 10,
    fontWeight: "600",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#C9CDD3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioActive: { borderColor: ORANGE },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE },

  flag: { width: 22, height: 22, borderRadius: 3 },

  saveBtn: {
    backgroundColor: ORANGE,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 14,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
