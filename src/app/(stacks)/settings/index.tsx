import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { ThemeContext } from "../../../providers/ThemeProvider";

const ORANGE = "#F58220";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const { setMode } = useContext(ThemeContext);
  const router = useRouter();

  const s = makeStyles(colors);
  const isLight = theme === "light";
  const version = "1.0.1";

  const onShare = async () => {
    try {
      await Share.share({
        message: t(
          "settings.share.message",
          "Yes Exchange — удобный обмен валют. Скачай приложение: https://yes.exchange/app"
        ),
      });
    } catch (e: any) {
      Alert.alert(
        t("settings.share.error", "Не удалось поделиться"),
        e?.message ?? ""
      );
    }
  };

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* === Settings rows === */}
        <ListItem
          icon="settings-outline"
          label={t("settings.title", "Настройки")}
          onPress={() => router.push("/(stacks)/settings/appset")}
          colors={colors}
        />
        <ListItem
          icon="chatbox-ellipses-outline"
          label={t("settings.feedbacks", "Отзывы и предложения")}
          onPress={() => router.push("/(stacks)/settings/feedbacks")}
          colors={colors}
        />
        <ListItem
          icon="newspaper-outline"
          label={t("settings.aboutus", "О компании")}
          onPress={() => router.push("/(stacks)/settings/aboutus")}
          colors={colors}
        />

        {/* === CTA === */}
        <TouchableOpacity
          style={s.cta}
          onPress={() => router.push("/(stacks)/settings/jointoteam")}
        >
          <Text style={s.ctaText}>
            {t("settings.cta", "Хочу к вам в команду!")}
          </Text>
        </TouchableOpacity>

        {/* === Share === */}
        <TouchableOpacity style={s.shareRow} onPress={onShare}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={colors.subtext}
          />
          <Text style={s.shareText}>
            {t("settings.share.label", "Поделиться приложением")}
          </Text>
        </TouchableOpacity>

        {/* === Version === */}
        <Text style={s.version}>
          {t("settings.version", "Версия приложения")} {version}
        </Text>
      </ScrollView>
    </View>
  );
}

function ListItem({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  colors: any;
}) {
  const s = makeStyles(colors);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardLeftIconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={s.cardLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={24} color={colors.subtext} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "22", // лёгкий контур
      paddingHorizontal: 14,
      paddingVertical: 16,
      marginTop: 14,
    },
    cardLeftIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    cardLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: "400",
    },

    cta: {
      backgroundColor: ORANGE,
      borderRadius: 16,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    ctaText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },

    shareRow: {
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
    },
    shareText: {
      color: colors.subtext,
      fontSize: 14,
      fontWeight: "700",
    },

    version: {
      textAlign: "center",
      color: colors.subtext,
      marginTop: 32,
      fontSize: 14,
    },
  });
