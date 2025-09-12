import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "providers";
import { STORE_LANGUAGE_KEY } from "../../../local/i18n";

const ONBOARDING_KEY = "is_onboarded";

const ChooseLanguageScreen = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { changeLanguage, language: lng } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        const language = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
        if (language) {
          await changeLanguage(language);
        }

        const isOnboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isOnboarded === "true") {
          router.replace("/(auth)");
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const setLanguage = async (language: string) => {
    try {
      await changeLanguage(language);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  useEffect(() => {
    if (lng && i18n) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  const handleContinue = async () => {
    try {
      const isOnboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (isOnboarded === "true") {
        router.replace("/(auth)");
      } else {
        router.push("/(auth)/onboarding");
      }
    } catch (error) {
      console.error("Error checking onboarding state:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const languageOptions = [
    {
      code: "kz",
      label: t("common.kz"),
      icon: require("../../../../assets/icons/kazakh.png"),
    },
    {
      code: "ru",
      label: t("common.ru"),
      icon: require("../../../../assets/icons/france.png"),
    },
    {
      code: "en",
      label: t("common.en"),
      icon: require("../../../../assets/icons/italian.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        {t("chooseLang.subtitle", "Select your preferred language to continue")}
      </Text>

      <View style={styles.languagesContainer}>
        {languageOptions.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.flagCard,
              lng === lang.code && styles.flagCardActive,
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Image source={lang.icon} style={styles.flagIcon} />
            <Text style={styles.flagLabel}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Pressable style={styles.navigateButton} onPress={handleContinue}>
        <Text style={styles.navigateText}>{t("common.continue")}</Text>
      </Pressable>
    </View>
  );
};

export default ChooseLanguageScreen;

const COLORS = {
  primary: "#A52A2A",
  accent: "#D4AF37",
  darkText: "#333333",
  buttonBackground: "#4F7942",
  activeBackground: "#FAF9F6",
  borderActive: "#A52A2A",
  flagText: "#333333",
};

const DIMENSIONS = {
  flagIconSize: 24,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
  languagesContainer: {
    marginBottom: 24,
  },
  flagCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  flagCardActive: {
    backgroundColor: COLORS.activeBackground,
    borderWidth: 1.5,
    borderColor: COLORS.borderActive,
  },
  flagIcon: {
    width: DIMENSIONS.flagIconSize,
    height: DIMENSIONS.flagIconSize,
  },
  flagLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 20,
    color: COLORS.flagText,
  },
  navigateButton: {
    backgroundColor: COLORS.buttonBackground,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  navigateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
