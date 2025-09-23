import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { STORE_LANGUAGE_KEY } from "../../../local/i18n";

const ONBOARDING_KEY = "is_onboarded";

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  subtext: "#6B7280",
  rowBg: "#FFFFFF",
  rowActiveBg: "#F5F6F8",
  rowBorder: "#E5E7EB",
  radioOff: "#9CA3AF",
};

type LangItem = {
  code: "kz" | "ru" | "en";
  label: string;
  icon: any;
};

export default function ChooseLanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { changeLanguage, language: lng } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<LangItem["code"]>("ru");

  useEffect(() => {
    const init = async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) as
          | LangItem["code"]
          | null;
        const onb = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (saved) {
          setSelected(saved);
          await changeLanguage(saved);
        }
        if (onb === "true") {
          // already onboarded → go straight to auth
          router.replace("/(auth)");
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  });

  useEffect(() => {
    if (lng && i18n) i18n.changeLanguage(lng);
  }, [lng, i18n]);

  const setLanguage = async (code: LangItem["code"]) => {
    setSelected(code);
    await changeLanguage(code);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(auth)"); // or: router.push("/(auth)/onboarding")
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  const languageOptions: LangItem[] = [
    {
      code: "kz",
      label: t("common.kz", "Казахский"),
      icon: require("../../../../assets/icons/kz.png"),
    },
    {
      code: "ru",
      label: t("common.ru", "Русский"),
      icon: require("../../../../assets/icons/ru.png"),
    },
    {
      code: "en",
      label: t("common.en", "Английский"),
      icon: require("../../../../assets/icons/eng.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        {t("chooseLang.desc", "Выберите язык приложения")}
      </Text>
      <Text style={styles.subtitle}>
        {t(
          "chooseLang.subtitle",
          "Эту настройку вы всегда сможете обновить в личном кабинете"
        )}
      </Text>

      <View style={{ marginTop: 16 }}>
        {languageOptions.map((item) => {
          const active = selected === item.code;
          return (
            <Pressable
              key={item.code}
              onPress={() => setLanguage(item.code)}
              style={[styles.row, active && styles.rowActive]}
              android_ripple={{ color: "#eee" }}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              {/* Radio */}
              <View
                style={[
                  styles.radioOuter,
                  active && { borderColor: COLORS.orange },
                ]}
              >
                {active ? <View style={styles.radioDot} /> : null}
              </View>

              {/* Flag + label */}
              <Image source={item.icon} style={styles.flag} />
              <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>{t("common.continue", "Продолжить")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", backgroundColor: "#fff" },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  logo: {
    width: 160,
    height: 80,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    color: COLORS.subtext,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.rowBg,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.rowBorder,
  },
  rowActive: {
    backgroundColor: COLORS.rowActiveBg,
    borderColor: COLORS.orange,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.radioOff,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.orange,
  },
  flag: { width: 24, height: 24, marginRight: 14 },
  rowLabel: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  rowLabelActive: { color: COLORS.text },

  cta: {
    marginTop: 28,
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  ctaText: { color: "#fff", fontWeight: "400", fontSize: 16 },
});
