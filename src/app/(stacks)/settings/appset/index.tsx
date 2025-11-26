import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCurrenciesQuery } from "../../../../services/yesExchange";

import CurrenciesModal from "../../../../components/CurrenciesModal";
import LanguageChooseModal from "../../../../components/LanguageModal";
import NotificationsModal from "../../../../components/NotificationsModal";
import { SwitchPill } from "../../../../components/SwitchPill";
import { useTheme } from "../../../../hooks/useTheme";
import { useAuth } from "../../../../providers/Auth";
import { ThemeContext } from "../../../../providers/ThemeProvider";

const ORANGE = "#F58220";

export default function AppSetScreen() {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const { setMode } = useContext(ThemeContext);
  // ✅ список валют
  const { data: rawCurrencies } = useCurrenciesQuery();
  const currencies = Array.isArray(rawCurrencies) ? rawCurrencies : [];
  // показываем все кроме KZT
  const filteredCurrencies = currencies.filter((c) => c.code !== "KZT");

  const { isGuest, language } = useAuth();

  const s = makeStyles(colors);
  const isLight = theme === "light";

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const [currentLang, setCurrentLang] = useState(
    language as "kz" | "ru" | "en"
  );

  const [selectedCurrencies, setSelectedCurrencies] = useState([
    "USD",
    "RUB",
    "EUR",
  ]);

  const [notifPrefs, setNotifPrefs] = useState({
    rates: true,
    finance: true,
    yesNews: false,
  });

  const nextTheme = isLight
    ? { label: t("appset.theme.light", "Светлая"), icon: "sunny-outline" }
    : { label: t("appset.theme.dark", "Тёмная"), icon: "moon-outline" };

  return (
    <View style={s.container}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {/* === THEME === */}
        <View style={s.card}>
          <View style={s.leftIconWrap}>
            <Ionicons name={nextTheme.icon as any} size={22} color={ORANGE} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>
              {t("appset.theme", "Тема приложения")}
            </Text>
            <Text style={s.cardSub}>{nextTheme.label}</Text>
          </View>

          <SwitchPill
            value={!isLight}
            onToggle={() => setMode(isLight ? "dark" : "light")}
          />
        </View>

        {/* === CURRENCY === */}

        {!isGuest && (
          <SettingsCard
            colors={colors}
            icon="cash-outline"
            title={t("appset.currency", "Валюта на главном табло")}
            subtitle={selectedCurrencies.join(", ")}
            onPress={() => setCurrencyModalVisible(true)}
          />
        )}

        {/* === LANGUAGE === */}
        <SettingsCard
          colors={colors}
          icon="globe-outline"
          title={t("appset.language", "Язык приложения")}
          subtitle={currentLang.toUpperCase()}
          onPress={() => setLangModalVisible(true)}
        />

        {/* === NOTIFICATIONS === */}
        {!isGuest && (
          <SettingsCard
            colors={colors}
            icon="notifications-outline"
            title={t("appset.notifications", "Уведомления")}
            subtitle={
              notifPrefs.rates || notifPrefs.finance || notifPrefs.yesNews
                ? t("appset.notifications.enabled", "Включены")
                : t("appset.notifications.disabled", "Отключены")
            }
            onPress={() => setNotifModalVisible(true)}
          />
        )}
      </ScrollView>

      {/* === MODALS === */}
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
        items={filteredCurrencies}
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

// ================================
// ✅ SETTINGS CARD COMPONENT
// ================================
function SettingsCard({ icon, title, subtitle, onPress, colors }: any) {
  const s = makeStyles(colors);

  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.leftIconWrap}>
        <Ionicons name={icon} size={22} color={ORANGE} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        {subtitle && <Text style={s.cardSub}>{subtitle}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={22} color={colors.subtext} />
    </Pressable>
  );
}

// ================================
// ✅ THEME STYLES (dynamic)
// ================================
const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
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

    cardTitle: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.text,
    },

    cardSub: {
      marginTop: 4,
      color: colors.subtext,
      fontSize: 14,
    },
  });
