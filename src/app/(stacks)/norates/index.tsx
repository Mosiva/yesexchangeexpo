import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** ====== helpers ====== */
const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#ECECEC";
const CARD = "#F7F7F9";

const fmt = (n: number) =>
  isFinite(n)
    ? n
        .toLocaleString("ru-RU", { maximumFractionDigits: 0 })
        .replace(/\u00A0/g, " ")
    : "";

const parse = (s: string) =>
  Number(
    String(s)
      .replace(/[^\d.,]/g, "")
      .replace(",", ".")
  );

/** ====== screen ====== */
export default function ReserveNoRateScreen() {
  const insets = useSafeAreaInsets();

  // Toggle: sell or buy
  const [mode, setMode] = useState<"sell" | "buy">("sell");

  // Pair (you can replace with your selector later)
  const from = { code: "KZT", name: "Казахстанский тенге", flag: "🌞" };
  const to = { code: "USD", name: "Доллар США", flag: "🇺🇸" };

  // Example direct rate: how many KZT for 1 USD (for demo)
  const rateKztPerUsd = 537.53;

  // Controlled amounts (as text)
  const [fromText, setFromText] = useState(fmt(537530));
  const [toText, setToText] = useState(fmt(1000));

  // Convert when either side changes
  const fromAmount = parse(fromText);
  const toAmount = parse(toText);

  // Recompute derived field
  const computed = useMemo(() => {
    if (mode === "sell") {
      // user edits FROM → compute TO
      return {
        from: fromAmount,
        to: isFinite(fromAmount) ? fromAmount / rateKztPerUsd : 0,
      };
    } else {
      // user edits TO → compute FROM
      return {
        from: isFinite(toAmount) ? toAmount * rateKztPerUsd : 0,
        to: toAmount,
      };
    }
  }, [mode, fromAmount, toAmount]);

  const rateLineLeft = "1 KZT";
  const rateLineRight =
    (1 / rateKztPerUsd).toFixed(9).replace(".", ",") + " USD";

  // Footer summary: always show the “target” currency total like in mock
  const footerSum = mode === "sell" ? computed.to : computed.to;
  const footerCode = to.code;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Данный вид брони не подразумевает сохранения курса
        </Text>

        {/* Segmented control */}
        <View style={styles.segmentWrap}>
          <Pressable
            onPress={() => setMode("sell")}
            style={[styles.segment, mode === "sell" && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "sell" && styles.segmentTextActive,
              ]}
            >
              Я продаю
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("buy")}
            style={[styles.segment, mode === "buy" && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === "buy" && styles.segmentTextActive,
              ]}
            >
              Я покупаю
            </Text>
          </Pressable>
        </View>

        {/* FROM row */}
        <FXRow
          flag={from.flag}
          code={from.code}
          name={from.name}
          value={mode === "sell" ? fmt(computed.from) : fmt(computed.from)}
          onChangeText={(t) => {
            if (mode === "sell") {
              setFromText(t);
              // recompute toText from t
              const v = parse(t);
              setToText(fmt(isFinite(v) ? v / rateKztPerUsd : 0));
            } else {
              // in “Я покупаю” user edits “Купить” (right), so lock this field
              setFromText(t); // allow editing if you want; mock shows the other locked
            }
          }}
          editable={mode === "sell"}
          suffix="₸"
          highlight={mode === "sell"}
          onPressSelect={() => {}}
        />

        {/* TO row */}
        <FXRow
          flag={to.flag}
          code={to.code}
          name={to.name}
          value={mode === "sell" ? fmt(computed.to) : fmt(computed.to)}
          onChangeText={(t) => {
            if (mode === "buy") {
              setToText(t);
              const v = parse(t);
              setFromText(fmt(isFinite(v) ? v * rateKztPerUsd : 0));
            } else {
              setToText(t);
            }
          }}
          editable={mode === "buy"}
          suffix="$"
          highlight={mode === "buy"}
          onPressSelect={() => {}}
          mutedCard // like gray card in mock
        />

        {/* Rate line */}
        <View style={styles.rateRow}>
          <Text style={styles.rateText}>
            {rateLineLeft} = {rateLineRight}
          </Text>
          <Text style={styles.delta}>+23,2 ▲</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerTitle}>Итого</Text>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Ваша сумма</Text>
          <Text style={styles.footerValue}>
            {fmt(footerSum)} {footerCode}
          </Text>
        </View>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Далее</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/** ====== currency row ====== */
function FXRow({
  flag,
  code,
  name,
  value,
  onChangeText,
  editable,
  suffix,
  highlight,
  mutedCard,
  onPressSelect,
}: {
  flag: string;
  code: string;
  name: string;
  value: string;
  onChangeText: (t: string) => void;
  editable: boolean;
  suffix: string;
  highlight?: boolean;
  mutedCard?: boolean;
  onPressSelect?: () => void;
}) {
  return (
    <View style={styles.fxRow}>
      {/* left currency card */}
      <Pressable
        style={[
          styles.currencyCard,
          mutedCard && { backgroundColor: "#F2F4F7" },
        ]}
        onPress={onPressSelect}
      >
        <View style={styles.flagWrap}>
          <Text style={{ fontSize: 18 }}>{flag}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>

      {/* right amount input */}
      <View style={[styles.amountWrap, highlight && { borderColor: ORANGE }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="numeric"
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
        <View style={styles.suffix}>
          <Text style={styles.suffixText}>{suffix}</Text>
        </View>
      </View>
    </View>
  );
}

/** ====== styles ====== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: SUB,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: "400",
  },

  segmentWrap: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F2F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: "#2B2B2B" },
  segmentText: { fontSize: 16, fontWeight: "400", color: "#8C8C8C" },
  segmentTextActive: { color: "#fff" },

  fxRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  flagWrap: {
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  code: { fontSize: 16, fontWeight: "700", color: TEXT },
  name: { fontSize: 11, color: SUB, marginTop: 2 , fontWeight: "400" },

  amountWrap: {
    width: 200,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  suffix: {
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
    paddingLeft: 10,
    height: "100%",
    justifyContent: "center",
  },
  suffixText: { fontSize: 14, fontWeight: "800", color: TEXT },

  rateRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  rateText: { color: TEXT, fontSize: 14, fontWeight: "400" },
  delta: { marginLeft: 10, color: "#16A34A", fontWeight: "400", fontSize: 14 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: TEXT,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footerLabel: { color: SUB, fontSize: 14, fontWeight: "400" },
  footerValue: { color: TEXT, fontSize: 18, fontWeight: "400" },
  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
