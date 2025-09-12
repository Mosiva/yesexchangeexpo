import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const ONBOARDING_KEY = "is_onboarded";

export const OnboardingScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      key: "1",
      title: "Более 100 лучших ресторанов в одном месте",
      image: require("../../../../assets/mock/os1.png"),
    },
    {
      key: "2",
      title: "Единая карта для всех любимых заведений",
      image: require("../../../../assets/mock/os2.png"),
    },
    {
      key: "3",
      title: "Эксклюзивные предложения — без ограничений",
      image: require("../../../../assets/mock/os3.png"),
    },
  ];

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(auth)");
  };

  const handleNext = async () => {
    if (currentSlide === slides.length - 1) {
      await handleComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <Pressable
          key={index}
          onPress={() => setCurrentSlide(index)}
          style={[
            styles.dot,
            currentSlide === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={slides[currentSlide].image} style={styles.image} />
      {renderDots()}

      <Text style={styles.title}>{slides[currentSlide].title}</Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.outlinedButton]}
          onPress={handleComplete}
        >
          <Text style={[styles.buttonText, styles.outlinedButtonText]}>
            {t("onboarding.skip")}
          </Text>
        </Pressable>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1
              ? t("onboarding.login")
              : t("onboarding.next")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const COLORS = {
  primary: "#A52A2A",
  accent: "#D4AF37",
  darkText: "#333333",
  buttonBackground: "#4F7942",
  dotActive: "#4F7942",
  dotInactive: "#E0E0E0",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 500,
    resizeMode: "contain",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.dotActive,
  },
  inactiveDot: {
    backgroundColor: COLORS.dotInactive,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.darkText,
    marginTop: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.darkText,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 30,
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  outlinedButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#A52A2A",
  },
  outlinedButtonText: {
    color: "#A52A2A",
  },
});
