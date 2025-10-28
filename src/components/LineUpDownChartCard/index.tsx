import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ================== Types ================== */
type Item = {
  code: string; // e.g. "USD"
  value: number | string; // e.g. 1533.4
  delta: number; // +23.2 or -23.2
  flagEmoji?: string; // optional emoji flag
  flagSource?: ImageSourcePropType; // or local/remote image
  label?: string; // default: "Курс НБ РК"
  chartSource?: ImageSourcePropType; // optional custom sparkline image
};

type Props = {
  items: Item[];
  initial?: number; // how many to show initially
  onMorePress?: () => void;
  expanded?: boolean;
};

/* ================== Defaults ================== */
const DEFAULT_UP_IMG = require("../../../assets/images/upline.png");
const DEFAULT_DOWN_IMG = require("../../../assets/images/downline.png");
const DEFAULT_NEUTRAL_IMG = require("../../../assets/images/neutral.png");

/* ================== Component ================== */
export default function LineUpDownChartCard({
  items,
  initial = 3,
  onMorePress,
  expanded: initialExpanded = false,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(initialExpanded);
  const visible = expanded ? items : items.slice(0, initial);

  return (
    <View>
      {visible.map((it, idx) => (
        <RateCard key={`${it.code}-${idx}`} item={it} />
      ))}

      {items.length > initial && !expanded && (
        <Pressable
          style={styles.moreBtn}
          // onPress={() => router.push("/(stacks)/archives")}
        >
          <Text style={styles.moreText}>Показать больше</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------ subcomponents ------------------------ */
function RateCard({ item }: { item: Item }) {
  const trend: "up" | "down" | "same" =
    item.delta === 0 ? "same" : item.delta > 0 ? "up" : "down";
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.7 }, // эффект при нажатии
      ]}
      // onPress={() =>
      //   router.push({
      //     pathname: "/(stacks)/archives/[id]",
      //     params: { id: item.code },
      //   })
      // }
    >
      {/* Left side */}
      <View style={styles.leftCol}>
        <View style={styles.flagWrap}>
          {item.flagSource ? (
            <Image source={item.flagSource} style={styles.flagImg} />
          ) : (
            <Text style={styles.flagEmoji}>{item.flagEmoji ?? "🏳️"}</Text>
          )}
        </View>

        <View>
          <Text style={styles.label}>{item.label ?? "Курс НБ РК"}</Text>
          <View style={styles.row}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.value}>{formatNum(item.value)}</Text>
            {trend !== "same" ? (
              <Text
                style={[
                  styles.delta,
                  trend === "up" ? styles.deltaUp : styles.deltaDown,
                ]}
              >
                {trend === "up" ? " +" : " -"}
                {formatNum(Math.abs(item.delta))}
                {trend === "up" ? " ▲" : " ▼"}
              </Text>
            ) : (
              <Text style={[styles.delta, styles.deltaSame]}>0.0 ＝</Text>
            )}
          </View>
        </View>
      </View>

      {/* Right side */}
      <Sparkline trend={trend} chartSource={item.chartSource} />
    </Pressable>
  );
}

function Sparkline({
  trend,
  chartSource,
}: {
  trend: "up" | "down" | "same";
  chartSource?: ImageSourcePropType;
}) {
  const src =
    chartSource ??
    (trend === "up"
      ? DEFAULT_UP_IMG
      : trend === "down"
      ? DEFAULT_DOWN_IMG
      : DEFAULT_NEUTRAL_IMG);

  return (
    <View style={styles.sparkWrap}>
      <Image source={src} style={styles.chartImg} resizeMode="cover" />
      <View
        style={[
          styles.sparkDot,
          {
            backgroundColor:
              trend === "up"
                ? "#10A44A"
                : trend === "down"
                ? "#DC3545"
                : "#9CA3AF", // серый цвет для нейтрального
          },
        ]}
      />
    </View>
  );
}

/* ------------------------------ helpers ------------------------------ */
function formatNum(n: number | string) {
  const num = typeof n === "number" ? n : Number(String(n).replace(/\s/g, ""));
  if (!isFinite(num)) return String(n);
  return num.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
}

/* ------------------------------- styles ------------------------------- */
const CARD_BG = "#FFFFFF";
const CARD_SHADOW = "rgba(0,0,0,0.06)";
const TEXT_MAIN = "#111827";
const TEXT_MUTED = "#6B7280";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: CARD_SHADOW,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  leftCol: { flexDirection: "row", alignItems: "center", flex: 1 },
  flagWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  flagImg: { width: 40, height: 40, borderRadius: 20 },
  flagEmoji: { fontSize: 28 },

  label: { color: TEXT_MUTED, fontSize: 12, fontWeight: "400" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },

  code: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "400",
    marginRight: 10,
  },
  value: { color: TEXT_MAIN, fontSize: 18, fontWeight: "400" },
  delta: { marginLeft: 10, fontSize: 11, fontWeight: "400" },
  deltaUp: { color: "#16A34A" },
  deltaDown: { color: "#DC2626" },
  deltaSame: { color: "#6B7280" },

  /* sparkline image container */
  sparkWrap: {
    width: 150,
    height: 66,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  chartImg: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  sparkDot: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { color: "#374151", fontSize: 14, fontWeight: "700" },
});
