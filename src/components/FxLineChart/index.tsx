import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  DateRangePickerModal,
  DateRangePickerModalRef,
} from "../DateRangePickerModal";

type Row = { ts: string; buy: number; sell: number };
type NbkRow = { ts: string; rate: number };

type Props = {
  rows: Row[];
  nbkRows?: NbkRow[];
  source: "yes" | "nbrk";
  onChangePeriod?: (
    p: "day" | "week" | "month",
    range?: { fromIso: string; toIso: string }
  ) => void;
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
  orange: "#F58220",
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

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    fromDisplay: string;
    toDisplay: string;
    fromIso: string;
    toIso: string;
  } | null>(null);

  const modalRef = useRef<DateRangePickerModalRef>(null);

  const screenWidth = Dimensions.get("window").width;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleChangePeriod = (p: "day" | "week" | "month", force?: boolean) => {
    if (p === period && !force) return;
    setPeriod(p);
    setSelectedPoint(null);
    setSelectedRange(null);
    onChangePeriod?.(p);
  };

  const handleConfirmRange = (range: {
    fromIso: string;
    toIso: string;
    fromDisplay: string;
    toDisplay: string;
  }) => {
    setSelectedRange(range);
    setPeriod("day");
    onChangePeriod?.("day", range);
  };

  const handleResetRange = () => {
    setSelectedRange(null);
    handleChangePeriod("day", true);
    modalRef.current?.reset(); // 👈 сбрасываем календарь
  };

  const sortedRows = useMemo(() => {
    if (source === "nbrk" && nbkRows?.length) {
      return [...nbkRows].sort(
        (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
      );
    }
    return [...rows].reverse();
  }, [rows, nbkRows, source]);

  const filtered = useMemo(() => {
    const maxLabels = 5;
    const step =
      sortedRows.length > maxLabels
        ? Math.ceil(sortedRows.length / maxLabels)
        : 1;
    return sortedRows.filter((_, i) => i % step === 0);
  }, [sortedRows]);

  const labels = useMemo(() => {
    return filtered.map((r) => {
      if (source === "nbrk") {
        // НБРК всегда в ISO, просто день.месяц
        const [year, month, day] = r.ts.split("T")[0].split("-");
        return `${day}.${month}`;
      }

      const [datePart, timePart] = r.ts.split(" ");
      const [d, m] = datePart.split(".");

      // Если выбран диапазон — всегда дата
      if (selectedRange) return `${d}.${m}`;

      // Если период день — часы (для ≤ 24 точек)
      if (period === "day" && sortedRows.length <= 24) return timePart;

      // Неделя или месяц — день.месяц
      return `${d}.${m}`;
    });
  }, [filtered, period, source, selectedRange, sortedRows.length]);

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

  const legend = source === "nbrk" ? ["Курс НБРК"] : ["Покупка", "Продажа"];

  return (
    <View>
      {/* --- Периоды / диапазон --- */}
      <View style={styles.segmentRow}>
        {selectedRange ? (
          <>
            <View style={{ flex: 1 }}>
              <Text style={styles.rangeTextInline}>
                {selectedRange.fromDisplay} — {selectedRange.toDisplay}
              </Text>
            </View>
            <Pressable onPress={handleResetRange}>
              <Text style={styles.resetText}>Сбросить</Text>
            </Pressable>
            <Pressable
              style={styles.calendarBtn}
              onPress={() => {
                Alert.alert(
                  "Диапазон уже выбран",
                  "Чтобы выбрать новые даты, сначала сбросьте текущий период.",
                  [{ text: "Вернуться", style: "cancel" }]
                );
              }}
            >
              <Ionicons name="calendar-outline" size={22} color={COLORS.text} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.segmentGroup}>
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
            </View>

            <Pressable
              style={styles.calendarBtn}
              onPress={() => setCalendarVisible(true)}
            >
              <Ionicons name="calendar-outline" size={22} color={COLORS.text} />
            </Pressable>
          </>
        )}
      </View>

      {/* --- График --- */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {filtered.length > 0 ? (
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
              propsForDots: { r: "4", strokeWidth: "1", stroke: "#fff" },
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
        ) : (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={{ color: COLORS.sub, fontSize: 15 }}>
              Нет данных для отображения
            </Text>
          </View>
        )}
      </Animated.View>

      {/* --- Tooltip --- */}
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

      {/* --- Модалка календаря --- */}
      <DateRangePickerModal
        ref={modalRef}
        isVisible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onConfirm={handleConfirmRange}
        allowPastDates={true}
      />
    </View>
  );
}

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
  rangeTextInline: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  resetText: { color: COLORS.orange, fontSize: 14, fontWeight: "700" },
  chart: { marginHorizontal: 16, marginTop: 8, borderRadius: 12 },
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
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 8,
    backgroundColor: COLORS.pillBg,
    borderRadius: 16,
    marginHorizontal: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  segmentGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  segment: {
    flex: 1,
    height: 44,
    marginHorizontal: 3,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.pillBg,
  },
  segmentText: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.pillBg,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
});
