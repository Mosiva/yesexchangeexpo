import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import CurrencyFlag from "../CurrencyFlag";

import FxLineChart from "../FxLineChart";
type NbkRow = { ts: string; rate: number };

type Row = { ts: string; buy: number; sell: number };

type Props = {
  rows?: Row[];
  nbkRows?: NbkRow[];
  latest?: Row | null;
  latestNbkRates?: NbkRow | null;
  code?: string;
  name?: string;
  flagEmoji?: string;
  onPressHeader?: () => void;
  onChangePeriod?: (period: "day" | "week" | "month") => void;
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
  pillBg: "#FFFFF",
  pillActiveBg: "#F9F9F9",
  pillActiveText: "#080420",
};

export default function ArchiveDetailCard({
  rows,
  nbkRows,
  code,
  name,
  onPressHeader,
  latest,
  latestNbkRates,
  onChangePeriod,
}: Props) {
  const data = rows ?? [];
  const [source, setSource] = useState<"yes" | "nbrk">("yes");

  return (
    <ScrollView style={styles.container} bounces>
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
            <View style={styles.flagWrap}>
              <CurrencyFlag code={code as any} size={48} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fxTitle}>{code}</Text>
            <Text style={styles.fxSubtitle}>{name}</Text>
          </View>
          <Ionicons name="chevron-down" size={22} color="#111827" />
        </View>
        {/* значения */}
        <View style={styles.fxRow}>
          {source === "yes" ? (
            <>
              <View style={styles.sideBlock}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.orangeDot }]}
                />
                <Text style={styles.fxValue}>
                  {latest ? latest.buy.toFixed(1) : "-"}
                </Text>
                <Text style={[styles.caption]}>Покупка</Text>
              </View>

              <View style={styles.sideBlock}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.blueDot }]}
                />
                <Text style={styles.fxValue}>
                  {latest ? latest.sell.toFixed(1) : "-"}
                </Text>
                <Text style={[styles.caption]}>Продажа</Text>
              </View>
            </>
          ) : (
            <View
              style={[
                styles.sideBlock,
                { width: "100%", alignItems: "flex-start" },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.fxValue}>
                {latestNbkRates ? latestNbkRates.rate.toFixed(2) : "-"}
              </Text>
              <Text style={[styles.caption]}>Курс НБКР</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Chart */}
      {data.length > 0 ? (
        <FxLineChart
          rows={data}
          onChangePeriod={onChangePeriod}
          nbkRows={nbkRows}
          source={source}
        />
      ) : (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: COLORS.sub, fontSize: 15 }}>
            Нет данных для отображения
          </Text>
        </View>
      )}

      {/* ✅ Таблица */}
      <Text style={styles.tableTitle}>Детали</Text>

      {source === "yes" ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.4 }]}>Дата</Text>
            <Text style={[styles.th, { flex: 1 }]}>Покупка</Text>
            <Text style={[styles.th, { flex: 1 }]}>Продажа</Text>
          </View>

          {data.map((r, i) => {
            return (
              <View key={`${r.ts}-${i}`} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.4 }]}>{r.ts}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{r.buy.toFixed(1)}</Text>
                <Text style={[styles.td, { flex: 1 }]}>
                  {r.sell.toFixed(1)}
                </Text>
              </View>
            );
          })}
        </>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.4 }]}>Дата</Text>
            <Text style={[styles.th, { flex: 1 }]}>Курс НБКР</Text>
          </View>

          {nbkRows?.map((r, i) => {
            // гарантированно корректный парсинг ISO-строки
            const [year, month, day] = r.ts.split("T")[0].split("-");
            const formattedDate = `${day}.${month}.${year.slice(2)}`;

            return (
              <View key={`${r.ts}-${i}`} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.4 }]}>{formattedDate}</Text>
                <Text style={[styles.td, { flex: 1 }]}>
                  {r.rate.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
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

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  pill: {
    flex: 1,
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
  flagWrap: {},
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
