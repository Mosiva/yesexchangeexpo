import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import LanguageChooseModal from "../../../../components/LanguageModal";

export default function AppSetScreen() {
  const [lightTheme, setLightTheme] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState<"kz" | "ru" | "en">("ru");

  const nextTheme = lightTheme
    ? { label: "Тёмная", icon: "moon-outline" as const }
    : { label: "Светлая", icon: "sunny-outline" as const };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Theme */}
        <View style={styles.card}>
          <View style={styles.leftIconWrap}>
            {/* show icon for the NEXT theme */}
            <Ionicons name={nextTheme.icon} size={22} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Тема приложения</Text>
            {/* show label for the NEXT theme */}
            <Text style={styles.cardSub}>{nextTheme.label}</Text>
          </View>

          {/* switch still reflects CURRENT theme (sun for light, moon for dark) */}
          <SwitchPill
            value={lightTheme}
            onToggle={() => setLightTheme((v) => !v)}
          />
        </View>

        {/* Currency on main board */}
        <Pressable
          style={styles.card}
          onPress={() => {
            /* navigate */
          }}
        >
          <View style={styles.leftIconWrap}>
            <Ionicons name="cash-outline" size={22} color={ORANGE} />
          </View>
          <Text style={[styles.cardTitle, { flex: 1 }]}>
            Валюта на главном табло
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
        </Pressable>

        {/* App language */}
        <Pressable
          style={styles.card}
          onPress={() => setLangModalVisible(true)}
        >
          <View style={styles.leftIconWrap}>
            <Ionicons name="globe-outline" size={22} color={ORANGE} />
          </View>
          <Text style={[styles.cardTitle, { flex: 1 }]}>Язык приложения</Text>
          <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
        </Pressable>

        {/* Notifications */}
        <Pressable
          style={styles.card}
          onPress={() => {
            /* navigate */
          }}
        >
          <View style={styles.leftIconWrap}>
            <Ionicons name="notifications-outline" size={22} color={ORANGE} />
          </View>
          <Text style={[styles.cardTitle, { flex: 1 }]}>Уведомления</Text>
          <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
        </Pressable>
      </ScrollView>
      {/* Модалка выбора языка */}
      <LanguageChooseModal
        visible={langModalVisible}
        value={currentLang}
        onClose={() => setLangModalVisible(false)}
        onConfirm={(next) => {
          setCurrentLang(next);
          setLangModalVisible(false);
        }}
      />
    </View>
  );
}

function SwitchPill({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={[styles.switchTrack, value ? styles.switchOn : styles.switchOff]}
      onPress={onToggle}
    >
      <View style={[styles.switchThumb, { left: value ? 42 : 3 }]}>
        <Ionicons name={value ? "moon" : "sunny"} size={16} color={ORANGE} />
      </View>
    </Pressable>
  );
}

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 14,
  },
  leftIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "400", color: "#111827" },
  cardSub: { marginTop: 4, color: "#6B7280", fontSize: 14 },

  // custom switch
  switchTrack: {
    width: 68,
    height: 32,
    borderRadius: 16,
    padding: 3,
    justifyContent: "center",
  },
  switchOn: { backgroundColor: "#2C2C2C" },
  switchOff: { backgroundColor: "#E5E7EB" },
  switchThumb: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
