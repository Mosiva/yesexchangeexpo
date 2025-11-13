import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../hooks/useTheme";

export default function SuccessFormScreen() {
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isJointTeam } = useLocalSearchParams<{ isJointTeam?: string }>();
  const isJoint = isJointTeam === "true";

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      {/* Центр контента */}
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Image
            source={require("../../../../../assets/images/success.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Текст */}
        {isJoint ? (
          <Text style={styles.text}>
            {t("successform.jointTeam", "Спасибо, наши специалисты рассмотрят ваше резюме и свяжутся с вами")}
          </Text>
        ) : (
          <Text style={styles.text}>
            {t("successform.feedbackSent", "Ваш отзыв успешно отправлен! Благодарим за доверие!")}
          </Text>
        )}
      </View>

      {/* Кнопка внизу */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/(main)")}
        >
          <Text style={styles.buttonText}>{t("successform.backToMain", "На главную")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  bg: "#FFFFFF",
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  image: {
    width: 180,
    height: 180,
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    color: colors.text,
    fontWeight: "700",
  },
  bottomBar: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  button: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
