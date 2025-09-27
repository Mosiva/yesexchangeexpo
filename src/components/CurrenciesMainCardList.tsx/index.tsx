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
};

type Props = {
  data: Rate[];
  onPressInfo?: (code: string) => void;
  /** Optional: still called when user expands/collapses */
  onPressMore?: () => void;
  /** Keep showing the “more” button (default true) */
  showMore?: boolean;
};

const ORANGE_BG = "#F79633";
const WHITE = "#FFFFFF";
const DIVIDER = "#EBA25A";
const CELL_TEXT = "#2B2B2B";

/** Keep these in sync to keep headers perfectly aligned with cells */
const CELL_MIN_W = 120;
const CELLS_GAP = 10;
const CELL_HEIGHT = 48;
const RADIUS = 10;

const DEFAULT_VISIBLE = 6;

export default function CurrenciesMainCardList({
  data,
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
      {/* Single header row aligned with the value columns */}
      {visibleData.length > 0 && (
        <View style={styles.labelsRow}>
          <Text style={styles.label}>Покупка</Text>
          <Text style={styles.label}>Продажа</Text>
        </View>
      )}

      {visibleData.map((r, idx) => (
        <View key={`${r.code}-${idx}`} style={styles.row}>
          <View style={styles.rowInner}>
            {/* Left: flag + code + small white dot */}
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

            {/* Right: two compact value cards */}
            <View style={styles.cellsRow}>
              <View style={styles.cell}>
                <Text style={styles.cellText}>{r.buy}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.cellText}>{r.sell}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          {idx !== visibleData.length - 1 && <View style={styles.divider} />}
        </View>
      ))}

      {/* Expand / Collapse */}
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

  /** Header labels aligned to the right-side cells */
  labelsRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: CELLS_GAP,
    paddingTop: 6,
    paddingBottom: 6,
  },
  label: {
    color: "#FFD7B0",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    width: CELL_MIN_W,
  },

  row: {
    paddingVertical: 8,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagImg: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  flagEmoji: { fontSize: 24, marginRight: 8 },
  code: { color: WHITE, fontSize: 24, fontWeight: "800" },

  cellsRow: {
    marginLeft: "auto",
    flexDirection: "row",
    gap: CELLS_GAP,
  },
  cell: {
    minWidth: CELL_MIN_W,
    height: CELL_HEIGHT,
    backgroundColor: WHITE,
    borderRadius: RADIUS,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cellText: { color: CELL_TEXT, fontSize: 18, fontWeight: "800" },

  divider: {
    height: 2,
    backgroundColor: DIVIDER,
    marginTop: 8,
  },

  moreBtn: { alignItems: "center", paddingVertical: 16 },
  moreText: { color: WHITE, fontSize: 18, fontWeight: "800" },
});
