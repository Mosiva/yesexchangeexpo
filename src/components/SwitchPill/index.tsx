import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function SwitchPill({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  const styles = getStyles(colors);
  return (
    <Pressable
      style={[styles.track, value ? styles.on : styles.off]}
      onPress={onToggle}
      disabled
    >
      <View style={[styles.thumb, { left: value ? 42 : 3 }]}>
        <Ionicons name={value ? "moon" : "sunny"} size={16} color="#F58220" />
      </View>
    </Pressable>
  );
}
const getStyles = (colors: any) =>
  StyleSheet.create({
    track: {
      width: 68,
      height: 32,
      borderRadius: 16,
      padding: 3,
      justifyContent: "center",
    },
    on: { backgroundColor: "#2C2C2C" },
    off: { backgroundColor: "#E5E7EB" },
    thumb: {
      position: "absolute",
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
  });
