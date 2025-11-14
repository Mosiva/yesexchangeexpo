import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export const Loader = () => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const { t } = useTranslation();
  return (
    <View style={s.overlay}>
      <View style={s.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.text}>{t("common.loading")}</Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    container: {
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background,
      borderRadius: 12,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    text: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
  });
