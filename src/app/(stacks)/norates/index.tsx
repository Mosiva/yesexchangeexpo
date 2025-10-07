import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CurrenciesListModalArchive from "../../../components/CurrenciesListModalArchive";
import CurrencyFlag from "../../../components/CurrencyFlag";
import { useExchangeRatesCurrentQuery } from "../../../services/yesExchange";
import { CurrencyCode } from "../../../types/api";

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
  const router = useRouter();
  const { id: branchIdParam } = useLocalSearchParams<{ id?: string }>();

  const [mode, setMode] = useState<"sell" | "buy">("sell");
  const [toCode, setToCode] = useState("USD");

  /** ====== API ====== */
  const {
    data: rawExchangeRates,
    refetch: refetchExchangeRates,
    isLoading: isExchangeRatesLoading,
    isError: isExchangeRatesError,
  } = useExchangeRatesCurrentQuery(
    {
      branchId: Number(branchIdParam),
      deltaPeriod: "day",
    },
    {
      skip: !branchIdParam,
    }
  );

  /** 🔄 Обновление данных при фокусе */
  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchExchangeRates()]);
  }, [refetchExchangeRates]);

  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  /** ====== Массив валют из API ====== */
  const currencies = useMemo(() => {
    if (!rawExchangeRates?.data) return [];
    return rawExchangeRates.data.map((item) => ({
      code: item.currency.code,
      name: item.currency.name,
      buy: item.buy,
      sell: item.sell,
    }));
  }, [rawExchangeRates]);

  const findCurrency = (code: string) =>
    currencies.find((c) => c.code === code) ?? {
      code: code as CurrencyCode,
      name: "",
      buy: 1,
      sell: 1,
    };

  const from = {
    code: "KZT" as CurrencyCode,
    name: "Казахстанский тенге",
    buy: 1,
    sell: 1,
  };
  const to = findCurrency(toCode);

  // Controlled amounts
  const [fromText, setFromText] = useState(fmt(1000));
  const [toText, setToText] = useState(fmt(1000 / 540));

  const fromAmount = parse(fromText);
  const toAmount = parse(toText);

  const rate = useMemo(() => {
    // KZT всегда базовая
    const fromRateInKzt = 1;
    const toRateInKzt = mode === "sell" ? to.sell : to.buy;
    return fromRateInKzt / toRateInKzt;
  }, [to, mode]);

  const computed = useMemo(() => {
    if (mode === "sell") {
      return {
        from: fromAmount,
        to: isFinite(fromAmount) ? fromAmount * rate : 0,
      };
    } else {
      return {
        from: isFinite(toAmount) ? toAmount / rate : 0,
        to: toAmount,
      };
    }
  }, [mode, fromAmount, toAmount, rate]);

  const rateLineLeft = `1 ${from.code}`;
  const rateLineRight = (1 / rate).toFixed(4) + " " + to.code;

  const footerSum = computed.to;
  const footerCode = to.code;

  // Modal
  const [showToModal, setShowToModal] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
      >
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
              Я покупаю
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
              Я продаю
            </Text>
          </Pressable>
        </View>
        {/* TO row — вводим валюту */}
        <FXRow
          flag={<CurrencyFlag code={to.code} size={18} />}
          code={to.code}
          name={to.name}
          value={fmt(toAmount)}
          onChangeText={(t) => {
            setToText(t);
            const v = parse(t);

            if (mode === "sell") {
              // 💸 продаём валюту, получаем тенге
              setFromText(fmt(isFinite(v) ? v * to.buy : 0));
            } else {
              // 💱 покупаем валюту, платим тенге
              setFromText(fmt(isFinite(v) ? v * to.sell : 0));
            }
          }}
          editable={true} // 👈 теперь всегда редактируется именно это поле
          suffix={to.code}
          highlight={true}
          onPressSelect={() => setShowToModal(true)}
        />

        {/* FROM row — всегда KZT, не редактируется */}
        <FXRow
          flag={<CurrencyFlag code="KZT" size={18} />}
          code="KZT"
          name="Казахстанский тенге"
          value={fmt(computed.from)}
          onChangeText={() => {}}
          editable={false}
          suffix="KZT"
          highlight={false}
          mutedCard
        />

        <View style={styles.rateRow}>
          <Text style={styles.rateText}>
            {rateLineLeft} = {rateLineRight}
          </Text>
          <Text style={styles.delta}>+0.2 ▲</Text>
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
        <Pressable
          style={styles.cta}
          onPress={() => router.push("/(stacks)/norates/moderation")}
        >
          <Text style={styles.ctaText}>Далее</Text>
        </Pressable>
      </View>

      {/* TO Modal */}
      <CurrenciesListModalArchive
        visible={showToModal}
        onClose={() => setShowToModal(false)}
        onConfirm={(selected: string[]) => {
          setToCode(selected[0]);
          setShowToModal(false);
        }}
        value={[toCode]}
        buttonText="Выбрать валюту"
        items={currencies.map((c) => ({
          code: c.code,
          name: c.name,
          flag: <CurrencyFlag code={c.code} size={24} />,
        }))}
      />
    </KeyboardAvoidingView>
  );
}

/** ====== FXRow component ====== */
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
  flag: React.ReactNode;
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
      <Pressable
        style={[
          styles.currencyCard,
          mutedCard && { backgroundColor: "#F2F4F7" },
        ]}
        onPress={onPressSelect}
      >
        <View style={styles.flagWrap}>{flag}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        {onPressSelect && (
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        )}
      </Pressable>

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
  subtitle: {
    color: SUB,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: "400",
  },
  segmentWrap: { flexDirection: "row", gap: 10, marginBottom: 12 },
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  code: { fontSize: 16, fontWeight: "700", color: TEXT },
  name: { fontSize: 11, color: SUB, marginTop: 2, fontWeight: "400" },
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
  amountInput: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT },
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
