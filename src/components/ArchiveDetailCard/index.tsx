import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FxLineChart from "../FxLineChart";

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

  const data = useMemo(
    () =>
      rows ?? [
        { ts: "21.08.2025 10:11", buy: 533.4, sell: 533.4 },
        { ts: "21.08.2025 11:54", buy: 549.4, sell: 538.4 },
        { ts: "21.08.2025 12:54", buy: 540.4, sell: 530.4 },
      ],
    [rows]
  );

  return (
    <ScrollView style={styles.container} bounces>
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

      {/* Chart */}
      <FxLineChart rows={data} />

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

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },


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
