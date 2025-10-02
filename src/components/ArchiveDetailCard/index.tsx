import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Row = { ts: string; buy: number; sell: number };

type Props = {
  rows?: Row[];
  code?: string; // e.g. "USD"
  name?: string; // e.g. "Доллар США"
  flagEmoji?: string; // e.g. "🇺🇸"
  onPressHeader?: () => void;
};

const COLORS = {
  bg: "#FFFFFF",
  card: "#F7F7F9",
  text: "#111827",
  sub: "#6B7280",
  border: "#ECECEC",
  pillBg: "#F3F4F6",
  pillActiveBg: "#111827",
  pillActiveText: "#FFFFFF",
  orange: "#F58220",
  orangeDot: "#F59E0B",
  blueDot: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
};

export default function ArchiveDetailCard({
  rows,
  code = "USD",
  name = "Доллар США",
  flagEmoji = "🇺🇸",
  onPressHeader,
}: Props) {
  const [source, setSource] = useState<"yes" | "nbrk">("yes");
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const data = useMemo(
    () =>
      rows ?? [
        { ts: "21.08.2025 11:11", buy: 533.4, sell: 533.4 },
        { ts: "21.08.2025 10:54", buy: 533.4, sell: 533.4 },
        { ts: "21.08.2025 10:54", buy: 533.4, sell: 533.4 },
      ],
    [rows]
  );

  return (
    <ScrollView style={styles.container} bounces>
      {/* Source tabs */}
      <View style={styles.tabsRow}>
        <Pill
          label="Yes Exchange"
          active={source === "yes"}
          onPress={() => setSource("yes")}
        />
        <Pill
          label="НБ КР"
          active={source === "nbrk"}
          onPress={() => setSource("nbrk")}
        />
      </View>

      {/* Currency header card */}
      <Pressable style={styles.fxCard} onPress={onPressHeader}>
        <View style={styles.fxHead}>
          <View style={styles.flagWrap}>
            <Text style={{ fontSize: 20 }}>{flagEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fxTitle}>{code}</Text>
            <Text style={styles.fxSubtitle}>{name}</Text>
          </View>
          <Ionicons name="chevron-down" size={22} color="#111827" />
        </View>

        {/* значения */}
        <View style={styles.fxRow}>
          <View style={styles.sideBlock}>
            <View style={[styles.dot, { backgroundColor: COLORS.orangeDot }]} />
            <Text style={styles.fxValue}>533,4</Text>
            <Text style={[styles.delta, styles.deltaDown]}>+23,2 ▼</Text>
            <Text style={styles.caption}>Покупка</Text>
          </View>

          <View style={styles.sideBlock}>
            <View style={[styles.dot, { backgroundColor: COLORS.blueDot }]} />
            <Text style={styles.fxValue}>535,8</Text>
            <Text style={[styles.delta, styles.deltaUp]}>+23,2 ▲</Text>
            <Text style={styles.caption}>Продажа</Text>
          </View>
        </View>
      </Pressable>

      {/* Period segmented control */}
      <View style={styles.segmentRow}>
        <Segment
          label="День"
          active={period === "day"}
          onPress={() => setPeriod("day")}
        />
        <Segment
          label="Неделя"
          active={period === "week"}
          onPress={() => setPeriod("week")}
        />
        <Segment
          label="Месяц"
          active={period === "month"}
          onPress={() => setPeriod("month")}
        />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={22} color="#111827" />
        </Pressable>
      </View>

      {/* Chart placeholder */}
      <ChartPlaceholder />

      {/* Details table */}
      <Text style={styles.tableTitle}>Детали</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1.4 }]}>Дата</Text>
        <Text style={[styles.th, { flex: 1 }]}>Покупка</Text>
        <Text style={[styles.th, { flex: 1 }]}>Продажа</Text>
      </View>
      {data.map((r, i) => (
        <View key={`${r.ts}-${i}`} style={styles.tr}>
          <Text style={[styles.td, { flex: 1.4 }]}>{r.ts}</Text>
          <Text style={[styles.td, { flex: 1 }]}>{r.buy.toFixed(1)}</Text>
          <Text style={[styles.td, { flex: 1 }]}>{r.sell.toFixed(1)}</Text>
        </View>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
/* ---------- small UI pieces ---------- */

function Pill({
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
      style={[styles.pill, active && { backgroundColor: COLORS.pillActiveBg }]}
    >
      <Text
        style={[
          styles.pillText,
          active && { color: COLORS.pillActiveText, fontWeight: "800" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
          active && { color: "#fff", fontWeight: "800" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Lightweight chart block (grid + two simple lines) */
function ChartPlaceholder() {
  return (
    <View style={styles.chartWrap}>
      {/* grid verticals */}
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[styles.gridLineV, { left: `${(i / 4) * 100}%` }]}
        />
      ))}
      {/* Y labels (mock) */}
      <View style={styles.yAxis}>
        {[
          "540,5",
          "540",
          "539,5",
          "539",
          "538,5",
          "538",
          "537,5",
          "537",
          "536,5",
        ].map((t, i) => (
          <Text key={i} style={styles.yLabel}>
            {t}
          </Text>
        ))}
      </View>
      {/* Blue line */}
      <View
        style={[
          styles.line,
          { backgroundColor: COLORS.blueDot, top: 120, left: 40, width: 160 },
        ]}
      />
      <View
        style={[
          styles.line,
          { backgroundColor: COLORS.blueDot, top: 150, left: 200, width: 120 },
        ]}
      />
      {/* Orange line */}
      <View
        style={[
          styles.line,
          { backgroundColor: COLORS.orange, top: 100, left: 40, width: 120 },
        ]}
      />
      <View
        style={[
          styles.line,
          { backgroundColor: COLORS.orange, top: 170, left: 160, width: 160 },
        ]}
      />
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  tabsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  pill: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.pillBg,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { color: COLORS.text, fontSize: 16, fontWeight: "700" },

  fxCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fxHead: { flexDirection: "row", alignItems: "center" },
  flagWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fxTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 26,
  },
  fxSubtitle: { fontSize: 14, color: COLORS.sub, marginTop: 2 },

  fxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  sideBlock: { width: "48%" },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  fxValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  delta: { marginLeft: 2, marginTop: 2, fontSize: 14, fontWeight: "700" },
  deltaUp: { color: COLORS.green },
  deltaDown: { color: COLORS.red },
  caption: { marginTop: 4, color: COLORS.sub, fontSize: 14 },

  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
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

  chartWrap: {
    height: 260,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E7E9EE",
  },
  yAxis: {
    position: "absolute",
    right: 6,
    top: 10,
    alignItems: "flex-end",
    gap: 12,
  },
  yLabel: { fontSize: 12, color: COLORS.sub },

  line: {
    position: "absolute",
    height: 3,
    borderRadius: 2,
  },

  tableTitle: {
    marginTop: 18,
    marginHorizontal: 16,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  tableHeader: {
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  th: { color: COLORS.sub, fontWeight: "700", fontSize: 14 },
  tr: {
    flexDirection: "row",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  td: { color: COLORS.text, fontSize: 16 },
});
