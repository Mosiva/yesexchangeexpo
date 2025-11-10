// components/LoginDiscountBanner.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const ORANGE = "#F58220";
const TEXT = "#2E2E2E";

export default function LoginDiscountBanner({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>
      {t("loginDiscountBanner.title", "Авторизуйтесь и получите")} <Text style={styles.accent}>{t("loginDiscountBanner.discount", "скидку 5%")}</Text>
         {"\n"}{t("loginDiscountBanner.subtitle", "на первое бронирование с привязкой к курсу")}
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.btnText}>{t("loginDiscountBanner.login", "Войти")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
  },
  title: {
    color: TEXT,
    fontSize: 16,
    lineHeight: 30,
    textAlign: "center",
    fontWeight: "400",
    marginBottom: 12,
  },
  accent: {
    color: ORANGE,
    fontWeight: "800",
  },
  btn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
