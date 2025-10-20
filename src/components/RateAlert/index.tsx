// components/RateAlert.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  /** ISO string or Date for “Курс по состоянию на …” */
  asOf: string | Date;
  /** Optional custom message under the title */
  message?: string;
  style?: ViewStyle;
};

export default function RateAlert({
  asOf,
  message = "Обратите внимание, курс может измениться к моменту получения валюты в обменном пункте.",
  style,
}: Props) {
  const dt = asOf instanceof Date ? asOf : new Date(asOf ?? Date.now());
  const title = `Курс по состоянию на ${dt.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#1F6FE5"
          style={styles.icon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#EAF1FF", // мягкий голубой фон
    borderRadius: 16,
    padding: 14,
    height: 105,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  // add/adjust styles
  row: { flexDirection: "row", alignItems: "flex-start" },
  icon: { marginRight: 8, marginTop: 2 }, // slight top offset to align with title
  title: { color: "#111827", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  body: { color: "#374151", fontSize: 14, lineHeight: 20 },
});
