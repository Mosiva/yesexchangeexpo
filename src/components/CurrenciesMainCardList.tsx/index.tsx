import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CurrencyCode } from "../../types/api";
import CurrencyFlag from "../CurrencyFlag"; // ✅ подключаем твой компонент

type Rate = {
  code: CurrencyCode;
  buy: string | number;
  sell: string | number;
  name?: string; // подсказка в тултипе
};

type Props = {
  data: Rate[];
  onPressExchange?: (payload: { type: "buy" | "sell"; rate: Rate }) => void;
  onPressMore?: () => void;
  showMore?: boolean;
};

const ORANGE_BG = "#F79633";
const WHITE = "#FFFFFF";
const DIVIDER = "#EBA25A";
const CELL_TEXT = "#2B2B2B";

const CELL_MIN_W = 110;
const CELLS_GAP = 10;
const CELL_HEIGHT = 48;
const RADIUS = 10;

const DEFAULT_VISIBLE = 6;

export default function CurrenciesMainCardList({
  data,
  onPressExchange,
  onPressMore,
  showMore = true,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  // which row's tooltip is visible (null = none)
  const [hintIdx, setHintIdx] = useState<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canExpand = data.length > DEFAULT_VISIBLE;
  const visibleData = useMemo(
    () => (expanded ? data : data.slice(0, DEFAULT_VISIBLE)),
    [expanded, data]
  );

  const handleToggle = () => {
    setExpanded((v) => !v);
    onPressMore?.();
  };

  const showHint = (idx: number) => {
    // toggle if the same row is pressed again
    const next = hintIdx === idx ? null : idx;
    setHintIdx(next);

    // clear any previous timer
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (next !== null) {
      hideTimerRef.current = setTimeout(() => setHintIdx(null), 2000);
    }
  };

  return (
    <View style={styles.container}>
      {visibleData.length > 0 && (
        <View style={styles.labelsRow}>
          <Text style={styles.label}>{t("currenciesMainCardList.purchase", "Покупка")}</Text>
          <Text style={styles.label}>{t("currenciesMainCardList.sale", "Продажа")}</Text>
        </View>
      )}

      {visibleData.map((r, idx) => (
        <View key={`${r.code}-${idx}`} style={styles.row}>
          <View style={styles.rowInner}>
            {/* left side */}
            <View style={styles.leftBlock}>
              <CurrencyFlag code={r.code} size={28} />

              <Text style={styles.code}>{r.code}</Text>

              {/* Info icon + tooltip */}
              <TouchableOpacity
                onPress={() => showHint(idx)}
                hitSlop={8}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="information-circle" size={16} color={WHITE} />
              </TouchableOpacity>

              {hintIdx === idx && !!(r.name || r.code) && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{r.name ?? r.code}</Text>
                </View>
              )}
            </View>

            {/* right side values */}
            <View style={styles.cellsRow}>
              <TouchableOpacity
                style={styles.cell}
                onPress={() => onPressExchange?.({ type: "buy", rate: r })}
              >
                <Text style={styles.cellText}>{r.buy}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cell}
                onPress={() => onPressExchange?.({ type: "sell", rate: r })}
              >
                <Text style={styles.cellText}>{r.sell}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />
        </View>
      ))}

      {showMore && canExpand && (
        <TouchableOpacity style={styles.moreBtn} onPress={handleToggle}>
          <Text style={styles.moreText}>
            {expanded ? t("currenciesMainCardList.hide", "Скрыть") : t("currenciesMainCardList.showMore", "Показать больше")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ORANGE_BG,
    paddingHorizontal: 20,
  },
  labelsRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: CELLS_GAP,
    paddingTop: 6,
    paddingBottom: 6,
  },
  label: {
    color: "#FFD7B0",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    width: CELL_MIN_W,
  },
  row: { paddingVertical: 8 },
  rowInner: { flexDirection: "row", alignItems: "center" },

  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative", // so tooltip positions relative to this block
  },
  flagImg: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  flagEmoji: { fontSize: 24, marginRight: 8 },
  code: { color: WHITE, fontSize: 16, fontWeight: "700" },

  // tooltip bubble
  tooltip: {
    position: "absolute",
    top: -40, // above the row
    left: 0,
    backgroundColor: "rgba(90, 60, 30, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 5,
  },
  tooltipText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  cellsRow: { marginLeft: "auto", flexDirection: "row", gap: CELLS_GAP },
  cell: {
    minWidth: CELL_MIN_W,
    height: CELL_HEIGHT,
    backgroundColor: WHITE,
    borderRadius: RADIUS,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cellText: { color: CELL_TEXT, fontSize: 16, fontWeight: "700" },

  divider: { height: 2, backgroundColor: DIVIDER, marginTop: 8 },

  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { color: WHITE, fontSize: 14, fontWeight: "700" },
});
