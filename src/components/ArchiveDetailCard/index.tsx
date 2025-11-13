import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import CurrencyFlag from "../CurrencyFlag";

import FxLineChart from "../FxLineChart";
type NbkRow = { ts: string; rate: number; changePercent: number };

type Row = {
  ts: string;
  buy: number;
  sell: number;
  change?: { buy: number; sell: number };
};

type Props = {
  rows?: Row[];
  nbkRows?: NbkRow[];
  latest?: Row | null;
  latestNbkRates?: NbkRow | null;
  code?: string;
  name?: string;
  flagEmoji?: string;
  onPressHeader?: () => void;
  onChangePeriod?: (
    period: "day" | "week" | "month",
    range?: { fromIso: string; toIso: string }
  ) => void;
};

const COLORS = {
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const data = rows ?? [];

  const [source, setSource] = useState<"yes" | "nbrk">("nbrk");
  const [currentPeriod, setCurrentPeriod] = useState<"day" | "week" | "month">(
    "day"
  );
  const [selectedRange, setSelectedRange] = useState<{
    fromIso: string;
    toIso: string;
  } | null>(null);

  const normalizedRows = useMemo(() => {
    if (!rows?.length) return [];

    // ✅ Если период — день И диапазона нет → возврат как есть
    const isDay = currentPeriod === "day" && !selectedRange;
    if (isDay) return rows;

    // ✅ Если диапазон выбран и он в пределах одного дня → возвращаем все точки
    if (selectedRange) {
      const sameDay =
        selectedRange.fromIso.split("T")[0] ===
        selectedRange.toIso.split("T")[0];

      if (sameDay) return rows; // день → все точки
    }

    // ✅ иначе — агрегируем по дате
    const map = new Map<string, Row>();
    rows.forEach((r) => {
      const dateKey = r.ts.split(",")[0].trim();
      map.set(dateKey, r); // последнее значение за день
    });

    return Array.from(map.entries()).map(([date, value]) => ({
      ...value,
      ts: date,
    }));
  }, [rows, currentPeriod, selectedRange]);
  return (
    <ScrollView style={styles.container} bounces>
      <View style={styles.tabsRow}>
        <Pill
          label="Yes Exchange"
          active={source === "yes"}
          onPress={() => setSource("yes")}
        />
        <Pill
          label={t("archive.nbkRate", "НБ РК")}
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
          <Ionicons name="chevron-down" size={22} color={colors.text} />
        </View>
        {/* значения */}
        {source === "yes" ? (
          <View style={styles.fxRow}>
            {/* --- Покупка --- */}
            <View
              style={[
                styles.sideBlock,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: COLORS.orangeDot, marginRight: 6 },
                ]}
              />
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.fxValue}>
                    {latest ? latest.buy.toFixed(1) : "-"}
                  </Text>

                  {latest?.change?.buy !== undefined &&
                    latest.change.buy > 0 && (
                      <Text style={[styles.delta, styles.deltaUp]}>
                        {" "}
                        +{latest.change.buy.toFixed(1)} ▲
                      </Text>
                    )}
                  {latest?.change?.buy !== undefined &&
                    latest.change.buy < 0 && (
                      <Text style={[styles.delta, styles.deltaDown]}>
                        {" "}
                        {latest.change.buy.toFixed(1)} ▼
                      </Text>
                    )}
                  {latest?.change?.buy === 0 && (
                    <Text style={[styles.delta, { color: colors.subtext }]}>
                      {" "}
                      {latest.change.buy.toFixed(1)} ＝
                    </Text>
                  )}
                </View>
                <Text style={styles.caption}>
                  {t("archive.purchase", "Покупка")}
                </Text>
              </View>
            </View>

            {/* --- Продажа --- */}
            <View
              style={[
                styles.sideBlock,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: COLORS.blueDot, marginRight: 6 },
                ]}
              />
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.fxValue}>
                    {latest ? latest.sell.toFixed(1) : "-"}
                  </Text>

                  {latest?.change?.sell !== undefined &&
                    latest.change.sell > 0 && (
                      <Text style={[styles.delta, styles.deltaUp]}>
                        {" "}
                        +{latest.change.sell.toFixed(1)} ▲
                      </Text>
                    )}
                  {latest?.change?.sell !== undefined &&
                    latest.change.sell < 0 && (
                      <Text style={[styles.delta, styles.deltaDown]}>
                        {latest.change.sell.toFixed(1)} ▼
                      </Text>
                    )}
                  {latest?.change?.sell === 0 && (
                    <Text style={[styles.delta, { color: colors.subtext }]}>
                      {latest.change.sell.toFixed(1)} ＝
                    </Text>
                  )}
                </View>
                <Text style={styles.caption}>
                  {t("archive.sale", "Продажа")}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.fxRow, { justifyContent: "flex-start" }]}>
            <View
              style={[
                styles.sideBlock,
                { flexDirection: "row", alignItems: "center", width: "100%" },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: COLORS.green, marginRight: 6 },
                ]}
              />
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.fxValue}>
                    {latestNbkRates ? latestNbkRates.rate : "-"}
                  </Text>
                  {latestNbkRates?.changePercent !== undefined &&
                    latestNbkRates.changePercent > 0 && (
                      <Text style={[styles.delta, styles.deltaUp]}>
                        {" "}
                        +{latestNbkRates.changePercent} ▲
                      </Text>
                    )}
                  {latestNbkRates?.changePercent !== undefined &&
                    latestNbkRates.changePercent < 0 && (
                      <Text style={[styles.delta, styles.deltaDown]}>
                        {latestNbkRates.changePercent} ▼
                      </Text>
                    )}
                  {latestNbkRates?.changePercent === 0 && (
                    <Text style={[styles.delta, { color: colors.subtext }]}>
                      {latestNbkRates.changePercent} ＝
                    </Text>
                  )}
                </View>
                <Text style={styles.caption}>
                  {t("archive.nbkRate", "Курс НБРК")}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>

      {/* Периоды всегда показываем */}
      <View style={{ marginTop: 10 }}>
        <FxLineChart
          rows={normalizedRows}
          nbkRows={nbkRows}
          source={source}
          onChangePeriod={(p, range) => {
            setCurrentPeriod(p);
            setSelectedRange(range ?? null);
            onChangePeriod?.(p, range);
          }}
        />
      </View>

      {/* ✅ Таблица */}
      <Text style={styles.tableTitle}>{t("archive.details", "Детали")}</Text>

      {source === "yes" ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.4 }]}>
              {t("archive.date", "Дата")}
            </Text>
            <Text style={[styles.th, { flex: 1 }]}>
              {t("archive.purchase", "Покупка")}
            </Text>
            <Text style={[styles.th, { flex: 1 }]}>
              {t("archive.sale", "Продажа")}
            </Text>
          </View>

          {normalizedRows.map((r, i) => {
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
            <Text style={[styles.th, { flex: 1.4 }]}>
              {t("archive.date", "Дата")}
            </Text>
            <Text style={[styles.th, { flex: 1 }]}>
              {t("archive.nbkRate", "Курс НБКР")}
            </Text>
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
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && { backgroundColor: colors.tabActive }]}
    >
      <Text
        style={[
          styles.pillText,
          active && { color: colors.text, fontWeight: "800" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- styles ---------- */

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    pillText: { color: colors.text, fontSize: 16, fontWeight: "700" },

    fxCard: {
      marginHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fxHead: { flexDirection: "row", alignItems: "center" },
    flagWrap: {},
    fxTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      lineHeight: 26,
    },
    fxSubtitle: { fontSize: 14, color: colors.subtext, marginTop: 2 },

    dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },

    tableTitle: {
      marginTop: 18,
      marginHorizontal: 16,
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    tableHeader: {
      flexDirection: "row",
      marginTop: 10,
      marginHorizontal: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    th: { color: colors.subtext, fontWeight: "700", fontSize: 14 },
    tr: {
      flexDirection: "row",
      marginHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    td: { color: colors.text, fontSize: 16 },
    fxRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
      paddingHorizontal: 4,
    },

    sideBlock: {
      width: "48%",
      flexDirection: "column",
      alignItems: "flex-start",
    },

    fxValue: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },

    delta: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },

    deltaUp: { color: COLORS.green },
    deltaDown: { color: COLORS.red },

    caption: {
      marginTop: 4,
      color: colors.subtext,
      fontSize: 14,
    },
  });
