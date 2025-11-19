import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "providers";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "../../hooks/useTheme";
import { STORE_LANGUAGE_KEY } from "../../local/i18n";

type LangCode = "kz" | "ru" | "en";

interface Props {
  visible: boolean;
  value?: LangCode;
  onClose: () => void;
  onConfirm?: (next: LangCode) => void;
}

export default function LanguageChooseModal({
  visible,
  value = "ru",
  onClose,
  onConfirm,
}: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { changeLanguage, language: lng } = useAuth();

  const [choice, setChoice] = useState<LangCode>(value);

  useEffect(() => {
    if (visible) setChoice(value);
  }, [visible, value]);

  useEffect(() => {
    if (lng && i18n) i18n.changeLanguage(lng);
  }, [lng, i18n]);

  const options = [
    {
      code: "kz",
      label: t("common.kz", "Казахский"),
      icon: require("../../../assets/icons/kz.png"),
    },
    {
      code: "ru",
      label: t("common.ru", "Русский"),
      icon: require("../../../assets/icons/ru.png"),
    },
    {
      code: "en",
      label: t("common.en", "Английский"),
      icon: require("../../../assets/icons/eng.png"),
    },
  ];

  const handleSave = async () => {
    await AsyncStorage.setItem(STORE_LANGUAGE_KEY, choice);
    await changeLanguage(choice);
    onConfirm?.(choice);
    onClose();
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
      backdropOpacity={0.55}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View
          style={[
            styles.content,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("chooseLang.desc", "Язык приложения")}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Items */}
          <View style={{ gap: 8 }}>
            {options.map((opt) => {
              const active = choice === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[
                    styles.row,
                    {
                      backgroundColor: active ? colors.active : "transparent",
                    },
                  ]}
                  onPress={() => setChoice(opt.code as LangCode)}
                  activeOpacity={0.8}
                >
                  {/* Radio */}
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {active && (
                      <View
                        style={[
                          styles.radioDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>

                  <Image source={opt.icon} style={styles.flag} />
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveText, { color: "#fff" }]}>
              {t("common.save", "Сохранить")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  overlay: { flex: 1, justifyContent: "flex-end" },

  content: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },

  handle: {
    width: 90,
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

  title: { fontSize: 16, fontWeight: "700" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  rowLabel: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "600",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  flag: { width: 22, height: 22, borderRadius: 3 },

  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 14,
  },

  saveText: { fontSize: 16, fontWeight: "700",  },
});
