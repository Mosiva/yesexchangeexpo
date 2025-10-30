import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type Row = { ts: string; buy: number; sell: number };

type Props = {
  rows: Row[];
  onChangePeriod?: (p: "day" | "week" | "month") => void;
};

const COLORS = {
  text: "#111827",
  sub: "#6B7280",
  pillBg: "#F3F4F6",
  pillActiveBg: "#111827",
  pillActiveText: "#FFFFFF",
};

export default function FxLineChart({ rows, onChangePeriod }: Props) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const screenWidth = Dimensions.get("window").width;

  // ✅ Animated opacity value
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 🔄 Плавный fade-in при изменении rows
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [rows]);

  const handleChangePeriod = (p: "day" | "week" | "month") => {
    if (p === period) return;
    setPeriod(p);
    onChangePeriod?.(p);
  };

  const labels = rows.map((r) => r.ts.split(" ")[1]);
  const buyData = rows.map((r) => r.buy);
  const sellData = rows.map((r) => r.sell);

  return (
    <View>
      {/* Segmented control */}
      <View style={styles.segmentRow}>
        <Segment
          label="День"
          active={period === "day"}
          onPress={() => handleChangePeriod("day")}
        />
        <Segment
          label="Неделя"
          active={period === "week"}
          onPress={() => handleChangePeriod("week")}
        />
        <Segment
          label="Месяц"
          active={period === "month"}
          onPress={() => handleChangePeriod("month")}
        />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.text} />
        </Pressable>
      </View>

      {/* ✅ Animated chart */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LineChart
          data={{
            labels,
            datasets: [
              { data: buyData, color: () => "#F59E0B" },
              { data: sellData, color: () => "#2563EB" },
            ],
            legend: ["Покупка", "Продажа"],
          }}
          width={screenWidth - 32}
          height={250}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            propsForDots: { r: "3", strokeWidth: "1", stroke: "#fff" },
          }}
          bezier
          style={styles.chart}
        />
      </Animated.View>
    </View>
  );
}

/* --- Segment --- */
function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segment,
        active && { backgroundColor: COLORS.pillActiveBg },
      ]}
    >
      <Text
        style={[
          styles.segmentText,
          active && { color: COLORS.pillActiveText, fontWeight: "800" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  segment: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.pillBg,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.pillBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
});
