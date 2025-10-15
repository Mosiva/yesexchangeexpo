// components/LoginDiscountBanner.tsx
import React from "react";
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
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>
        Авторизуйтесь и получите <Text style={styles.accent}>скидку 5%</Text>
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.btnText}>Войти</Text>
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
