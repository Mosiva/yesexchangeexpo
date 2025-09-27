import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Rate = {
  code: string;
  buy: string | number;
  sell: string | number;
  flagEmoji?: string;
  flagSource?: ImageSourcePropType;
  name?: string;
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
  const [expanded, setExpanded] = useState(false);

  const canExpand = data.length > DEFAULT_VISIBLE;
  const visibleData = useMemo(
    () => (expanded ? data : data.slice(0, DEFAULT_VISIBLE)),
    [expanded, data]
  );

  const handleToggle = () => {
    setExpanded((v) => !v);
    onPressMore?.();
  };

  return (
    <View style={styles.container}>
      {visibleData.length > 0 && (
        <View style={styles.labelsRow}>
          <Text style={styles.label}>Покупка</Text>
          <Text style={styles.label}>Продажа</Text>
        </View>
      )}

      {visibleData.map((r, idx) => (
        <View key={`${r.code}-${idx}`} style={styles.row}>
          <View style={styles.rowInner}>
            <View style={styles.leftBlock}>
              {r.flagSource ? (
                <Image source={r.flagSource} style={styles.flagImg} />
              ) : (
                <Text style={styles.flagEmoji}>{r.flagEmoji ?? "🏳️"}</Text>
              )}
              <Text style={styles.code}>{r.code}</Text>
              <Ionicons
                name="ellipse"
                size={6}
                color={WHITE}
                style={{ marginLeft: 8 }}
              />
            </View>

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

          {idx !== visibleData.length - 1 && <View style={styles.divider} />}
        </View>
      ))}

      {showMore && canExpand && (
        <TouchableOpacity style={styles.moreBtn} onPress={handleToggle}>
          <Text style={styles.moreText}>
            {expanded ? "Скрыть" : "Показать больше"}
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
  leftBlock: { flexDirection: "row", alignItems: "center" },
  flagImg: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  flagEmoji: { fontSize: 24, marginRight: 8 },
  code: { color: WHITE, fontSize: 16, fontWeight: "700" },
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
