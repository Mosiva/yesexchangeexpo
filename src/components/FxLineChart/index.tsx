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
type NbkRow = { ts: string; rate: number };

type Props = {
  rows: Row[];
  nbkRows?: NbkRow[];
  source: "yes" | "nbrk";
  onChangePeriod?: (p: "day" | "week" | "month") => void;
};

const COLORS = {
  text: "#111827",
  sub: "#6B7280",
  pillBg: "#F3F4F6",
  pillActiveBg: "#111827",
  pillActiveText: "#FFFFFF",
  buy: "#F59E0B",
  sell: "#2563EB",
  nbkr: "#16A34A",
};

export default function FxLineChart({
  rows,
  nbkRows,
  source,
  onChangePeriod,
}: Props) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
  } | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Плавная анимация появления
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [rows, nbkRows, source]);

  const handleChangePeriod = (p: "day" | "week" | "month") => {
    if (p === period) return;
    setPeriod(p);
    setSelectedPoint(null);
    onChangePeriod?.(p);
  };

  // --- Выбор данных ---
  const sortedRows = React.useMemo(() => {
    if (source === "nbrk" && nbkRows?.length) {
      return [...nbkRows].sort(
        (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
      );
    }
    return [...rows].reverse();
  }, [rows, nbkRows, source]);

  const filtered = React.useMemo(() => {
    const maxLabels = 5;
    const step =
      sortedRows.length > maxLabels
        ? Math.ceil(sortedRows.length / maxLabels)
        : 1;
    return sortedRows.filter((_, i) => i % step === 0);
  }, [sortedRows]);

  // --- Формат подписей ---
  const labels = React.useMemo(() => {
    return filtered.map((r) => {
      if (source === "nbrk") {
        const [year, month, day] = r.ts.split("T")[0].split("-");
        return `${day}.${month}`;
      }
      const [datePart, timePart] = r.ts.split(" ");
      if (period === "day") return timePart;
      const [d, m] = datePart.split(".");
      return `${d}.${m}`;
    });
  }, [filtered, period, source]);

  // --- Формируем данные для графика ---
  const datasets =
    source === "nbrk"
      ? [
          {
            data: filtered.map((r: any) => r.rate),
            color: () => COLORS.nbkr,
            strokeWidth: 2,
          },
        ]
      : [
          {
            data: filtered.map((r: any) => r.buy),
            color: () => COLORS.buy,
            strokeWidth: 2,
          },
          {
            data: filtered.map((r: any) => r.sell),
            color: () => COLORS.sell,
            strokeWidth: 2,
          },
        ];

  const legend = source === "nbrk" ? ["Курс НБКР"] : ["Покупка", "Продажа"];

  return (
    <View>
      {/* Переключатели периода */}
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

      {/* График */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LineChart
          data={{
            labels,
            datasets,
            legend,
          }}
          width={screenWidth - 32}
          height={250}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            propsForDots: {
              r: "4",
              strokeWidth: "1",
              stroke: "#fff",
            },
          }}
          bezier
          style={styles.chart}
          onDataPointClick={(data) => {
            setSelectedPoint({
              x: data.x,
              y: data.y,
              value: data.value,
              label: labels[data.index] ?? "",
            });
          }}
        />
      </Animated.View>

      {/* Тултип */}
      {selectedPoint && (
        <Animated.View
          style={[
            styles.tooltip,
            { left: selectedPoint.x + 20, top: selectedPoint.y + 60 },
          ]}
        >
          <Text style={styles.tooltipText}>
            {`${selectedPoint.label}\n${selectedPoint.value.toFixed(2)}`}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

/* --- Кнопки сегментов --- */
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

/* --- Стили --- */
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
  tooltip: {
    position: "absolute",
    backgroundColor: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
