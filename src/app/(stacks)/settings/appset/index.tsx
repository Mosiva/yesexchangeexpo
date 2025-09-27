import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import CurrenciesModal from "../../../../components/CurrenciesModal"; // поправь путь
import LanguageChooseModal from "../../../../components/LanguageModal";
import NotificationsModal from "../../../../components/NotificationsModal"; // поправь путь

const ORANGE = "#F58220";

export default function AppSetScreen() {
  const [lightTheme, setLightTheme] = useState(false);

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const [currentLang, setCurrentLang] = useState<"kz" | "ru" | "en">("ru");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    "USD",
    "RUB",
    "EUR",
  ]);
  const [notifPrefs, setNotifPrefs] = useState({
    rates: true,
    finance: true,
    yesNews: false,
  });

  const nextTheme = lightTheme
    ? { label: "Тёмная", icon: "moon-outline" as const }
    : { label: "Светлая", icon: "sunny-outline" as const };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Theme */}
        <View style={styles.card}>
          <View style={styles.leftIconWrap}>
            <Ionicons name={nextTheme.icon} size={22} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Тема приложения</Text>
            <Text style={styles.cardSub}>{nextTheme.label}</Text>
          </View>
          <SwitchPill
            value={lightTheme}
            onToggle={() => setLightTheme((v) => !v)}
          />
        </View>

        {/* Currency */}
        <SettingsCard
          icon="cash-outline"
          title="Валюта на главном табло"
          subtitle={selectedCurrencies.join(", ")}
          onPress={() => setCurrencyModalVisible(true)}
        />

        {/* Language */}
        <SettingsCard
          icon="globe-outline"
          title="Язык приложения"
          subtitle={currentLang.toUpperCase()}
          onPress={() => setLangModalVisible(true)}
        />

        {/* Notifications */}
        <SettingsCard
          icon="notifications-outline"
          title="Уведомления"
          subtitle={
            notifPrefs.rates || notifPrefs.finance || notifPrefs.yesNews
              ? "Включены"
              : "Отключены"
          }
          onPress={() => setNotifModalVisible(true)}
        />
      </ScrollView>

      {/* Modals */}
      <LanguageChooseModal
        visible={langModalVisible}
        value={currentLang}
        onClose={() => setLangModalVisible(false)}
        onConfirm={(next) => {
          setCurrentLang(next);
          setLangModalVisible(false);
        }}
      />

      <CurrenciesModal
        visible={currencyModalVisible}
        value={selectedCurrencies}
        onClose={() => setCurrencyModalVisible(false)}
        onConfirm={(next) => {
          setSelectedCurrencies(next);
          setCurrencyModalVisible(false);
        }}
      />

      <NotificationsModal
        visible={notifModalVisible}
        value={notifPrefs}
        onClose={() => setNotifModalVisible(false)}
        onConfirm={(next) => {
          setNotifPrefs(next);
          setNotifModalVisible(false);
        }}
      />
    </View>
  );
}

function SettingsCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.leftIconWrap}>
        <Ionicons name={icon as any} size={22} color={ORANGE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
    </Pressable>
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
