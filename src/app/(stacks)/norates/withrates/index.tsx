import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
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
import MaskInput from "react-native-mask-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CurrenciesListModalArchive from "../../../../components/CurrenciesListModalArchive";
import CurrencyFlag from "../../../../components/CurrencyFlag";
import { useAuth } from "../../../../providers/Auth";
import {
  useBookingsQuery,
  useCreateBookingMutation,
  useCreateGuestBookingMutation,
  useExchangeRatesCurrentQuery,
} from "../../../../services/yesExchange";
import { BookingDto, CurrencyCode } from "../../../../types/api";
import { getCurrencySymbol } from "../../../../utils/currency";
import { formatCurrencyDisplay } from "../../../../utils/formatCurrencyDisplay";

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

export default function ReserveWithRateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    id: branchIdParam,
    address,
    mode: modeParam,
    fromCode,
    fromName,
    rate,
    sellAmount,
    receiveAmount,
  } = useLocalSearchParams<{
    id?: string;
    address?: string;
    mode?: "buy" | "sell";
    fromCode?: string;
    fromName?: string;
    rate?: string;
    sellAmount?: string;
    receiveAmount?: string;
  }>();

  const { isGuest } = useAuth();

  /** === API === */
  const {
    data: rawBookings,
    refetch: refetchBookings,
    isFetching,
    isError,
  } = useBookingsQuery({
    page: 1,
    limit: 100,
  });

  // ---- Guest login (phone) state ----
  const [digits, setDigits] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("+7");

  /** ====== Mode & Currency ====== */
  const [mode, setMode] = useState<"sell" | "buy">(modeParam ?? "sell");

  const [toCode, setToCode] = useState<string>("USD");
  const [rateParam, setRateParam] = useState<number>(Number(rate) || 0);
  const initializedRef = useRef(false);

  /** ====== API ====== */
  const {
    data: rawExchangeRates,
    refetch: refetchExchangeRates,
    isLoading: isExchangeRatesLoading,
  } = useExchangeRatesCurrentQuery(
    {
      branchId: Number(branchIdParam),
      limit: 100,
    },
    { skip: !branchIdParam }
  );

  const hasPreviousBookings = rawBookings?.data && rawBookings.data.length > 0;
  const userHasBookings = !!rawBookings?.data?.length;

  const [doCreateBooking, { isLoading: isCreating }] =
    useCreateBookingMutation();
  const [doCreateGuestBooking, { isLoading: isCreatingGuest }] =
    useCreateGuestBookingMutation();

  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchExchangeRates()]);
  }, [refetchExchangeRates]);

  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  useEffect(() => {
    // --- если пришли параметры из CurrencyExchangeModal ---
    if (fromCode && rateParam > 0) {
      setToCode(fromCode);

      const sell = Number(sellAmount);
      const receive = Number(receiveAmount);

      if (modeParam === "sell") {
        if (sell && receive) {
          setToText(fmt(sell));
          setFromText(fmt(receive));
        } else {
          setToText("1");
          setFromText(fmt(rateParam));
        }
      } else {
        if (sell && receive) {
          setFromText(fmt(sell));
          setToText(fmt(receive));
        } else {
          setFromText("1");
          setToText(fmt(1 / rateParam));
        }
      }

      // 💡 теперь — НЕ ставим initializedRef, чтобы можно было заново пересчитать при новой валюте
      return;
    }

    // --- обычный сценарий (открыт напрямую) ---
    if (!initializedRef.current && rawExchangeRates?.data?.length) {
      const foundUSD = rawExchangeRates.data.find(
        (c) => c.currency?.code === "USD"
      )?.currency?.code;
      const firstCode = rawExchangeRates.data[0]?.currency?.code;
      const initialCode = foundUSD || firstCode;
      if (initialCode) setToCode(initialCode);

      setFromText("");
      setToText("");

      const found = rawExchangeRates.data.find(
        (c) => c.currency?.code === initialCode
      );
      if (found) {
        const currentRate = mode === "sell" ? found.sell : found.buy;
        setRateParam(currentRate || 0);
      }

      initializedRef.current = true;
    }
  }, [
    fromCode,
    rateParam,
    modeParam,
    sellAmount,
    receiveAmount,
    rawExchangeRates,
  ]);

  const currencies = useMemo(() => {
    if (!rawExchangeRates?.data) return [];
    return rawExchangeRates.data.map((item) => ({
      id: item.id,
      code: item.currency.code,
      name: item.currency.name,
      buy: item.buy,
      sell: item.sell,
      change: item.change || { buy: 0, sell: 0 },
      trend: item.trend || "same",
    }));
  }, [rawExchangeRates]);

  const findCurrency = (code: string) =>
    currencies.find((c) => c.code === code) ?? {
      id: 0,
      code: code as CurrencyCode,
      name: "",
      buy: 1,
      sell: 1,
      change: { buy: 0, sell: 0 },
      trend: "same" as const,
    };

  const from = {
    code: "KZT" as CurrencyCode,
    name: "Казахстанский тенге",
    buy: 1,
    sell: 1,
  };
  const to = findCurrency(toCode);
  const [toText, setToText] = useState("0");
  const [fromText, setFromText] = useState("0");
  const [activeInput, setActiveInput] = useState<"to" | "from" | null>(null);

  useEffect(() => {
    if (!to.buy || !to.sell) return;

    const valTo = parse(toText);
    const valFrom = parse(fromText);

    if (activeInput === "to") {
      const sum = mode === "sell" ? valTo * to.buy : valTo * to.sell;
      setFromText(fmt(sum));
    } else if (activeInput === "from") {
      const sum = mode === "sell" ? valFrom / to.buy : valFrom / to.sell;
      setToText(fmt(sum));
    } else {
      // 💡 если пользователь ничего не редактирует — пересчитать по текущему режиму
      if (valTo > 0) {
        const sum = mode === "sell" ? valTo * to.buy : valTo * to.sell;
        setFromText(fmt(sum));
      } else if (valFrom > 0) {
        const sum = mode === "sell" ? valFrom / to.buy : valFrom / to.sell;
        setToText(fmt(sum));
      }
    }
  }, [toText, fromText, mode, to, activeInput]);
  const toAmount = parse(toText);

  const computed = useMemo(() => {
    if (mode === "sell") {
      return { from: isFinite(toAmount) ? toAmount * to.buy : 0, to: toAmount };
    } else {
      return {
        from: isFinite(toAmount) ? toAmount * to.sell : 0,
        to: toAmount,
      };
    }
  }, [mode, toAmount, to]);

  const rateLineLeft = `1 ${to.code}`;
  const rateLineRight = `${(mode === "sell" ? to.buy : to.sell).toFixed(
    2
  )} KZT`;

  const deltaValue = useMemo(() => {
    if (!to) return 0;
    const val = mode === "sell" ? to.change.buy : to.change.sell;
    return val ?? 0;
  }, [to, mode]);

  const deltaTrend = useMemo(() => {
    if (!to?.trend) return "same";
    if (typeof to.trend === "object") {
      return mode === "sell" ? to.trend.buy ?? "same" : to.trend.sell ?? "same";
    }
    return to.trend;
  }, [to, mode]);
  const [showToModal, setShowToModal] = useState(false);
  const footerSum = toAmount;

  const fromSymbol = getCurrencySymbol(from.code);
  const toSymbol = getCurrencySymbol(to.code as CurrencyCode);

  // Валидные префиксы телефонов Казахстана
  const validPrefixes = [
    "700",
    "701",
    "702",
    "703",
    "704",
    "705",
    "706",
    "707",
    "708",
    "709",
    "747",
    "771",
    "775",
    "776",
    "777",
    "778",
  ];
  const prefix = digits.slice(0, 3);
  const isValid = digits.length === 10 && validPrefixes.includes(prefix);
  const e164 = `+7${digits}`;

  /** ====== Сабмит ====== */
  const handleCreateBooking = async () => {
    if (!branchIdParam || !to?.id) {
      Alert.alert("Ошибка", "Не удалось определить валюту или филиал.");
      return;
    }
    if (isGuest && !isValid) {
      Alert.alert(
        "Ошибка",
        "Введите корректный номер телефона Казахстана (+7 7XX XXX-XX-XX)."
      );
      return;
    }
    // ✅ Найдём курс тенге (KZT)
    const kztRate = currencies.find((c) => c.code === "KZT");
    if (!kztRate) {
      Alert.alert("Ошибка", "Не найден курс KZT.");
      return;
    }
    const payload = {
      branchId: Number(branchIdParam),
      exchangeRateId: to.id, // выбранная валюта
      amount: footerSum.toFixed(2),
      operationType: mode,
      isRateLocked: true,
    };

    try {
      let response;
      if (isGuest) {
        response = await doCreateGuestBooking({
          phone: e164,
          data: payload,
        }).unwrap();
      } else {
        response = await doCreateBooking(payload).unwrap();
      }
      const bookingId = (response as BookingDto).id;
      const bookingBitrixId = (response as BookingDto).number;
      const displayAmount = fmt(toAmount);
      const displayCurrency = to.code;

      router.push({
        pathname: "/(stacks)/norates/moderation",
        params: {
          id: bookingId?.toString() ?? "",
          bitrixId: bookingBitrixId?.toString() ?? "",
          kind: "С привязкой к курсу",
          amount: displayAmount,
          currency: displayCurrency,
          rateText: `${rateLineLeft} = ${rateLineRight}`,
          address: address ?? "Неизвестный филиал",
          phone: e164,
        },
      });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Не удалось создать бронь. Попробуйте ещё раз.";
      Alert.alert("Ошибка", msg);
    }
  };
  const { text: displayValue } = formatCurrencyDisplay(fmt(footerSum), to.code);

  const discountValue = useMemo(() => {
    if (isGuest) return 0;

    const kztAmount = computed.from; // сумма в тенге

    if (mode === "buy") {
      // Скидка 5% — уменьшаем сумму
      return kztAmount * 0.05;
    } else if (mode === "sell") {
      // Наоборот — добавляем 5%
      return -kztAmount * 0.05;
    }

    return 0;
  }, [isGuest, computed.from, mode]);
  const canShowDiscount = () => {
    if (isGuest) return false; // гостям не даём скидку

    // ✅ Если нет ни одной брони — показываем скидку
    if (!hasPreviousBookings) return true;

    // ✅ Если сумма ≥ 500 000 — тоже показываем
    if (computed.from >= 500000) return true;

    // ❌ иначе — нет скидки
    return false;
  };

  function getDiscountMessage() {
    const isBuy = mode === "buy";

    // ✅ Если есть бронь и скидка/наценка недоступна — показываем короткий текст
    if (userHasBookings && !canShowDiscount()) {
      return isBuy
        ? "Скидка доступна только при сумме больше 500 000 тенге"
        : "Наценка доступна только при сумме больше 500 000 тенге";
    }

    // ✅ Если скидку можно показать (первая бронь или сумма >= 500к)
    if (canShowDiscount()) {
      if (userHasBookings) {
        // Есть предыдущие брони → условие только по сумме
        return isBuy
          ? "Скидка доступна только при сумме больше 500 000 тенге"
          : "Наценка доступна только при сумме больше 500 000 тенге";
      } else {
        // Первая бронь → полное условие
        return isBuy
          ? "Скидка доступна только на первую бронь или сумму больше 500 000 тенге"
          : "Наценка доступна только на первую бронь или сумму больше 500 000 тенге";
      }
    }

    // ✅ По умолчанию — ничего не показывать
    return null;
  }
  const discountMsg = getDiscountMessage();

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
          Данный вид брони подразумевает сохранение курса
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

        {/* Валюта */}
        <FXRow
          flag={<CurrencyFlag code={to.code as CurrencyCode} size={18} />}
          code={to.code}
          name={to.name}
          value={toText}
          onChangeText={(t) => {
            setActiveInput("to");
            setToText(t);
          }}
          editable={true}
          suffix={toSymbol}
          highlight={activeInput === "to"}
          onPressSelect={() => setShowToModal(true)}
        />

        {/* Тенге */}
        <FXRow
          flag={<CurrencyFlag code="KZT" size={18} />}
          code="KZT"
          name="Казахстанский тенге"
          value={fromText}
          onChangeText={(t) => {
            setActiveInput("from");
            setFromText(t);
          }}
          editable={true}
          suffix={fromSymbol}
          highlight={activeInput === "from"}
          mutedCard
        />

        {/* Rate line */}
        <View style={styles.rateRow}>
          <Text style={styles.rateText}>
            {rateLineLeft} = {rateLineRight}
          </Text>
          {deltaTrend === "up" && (
            <Text style={[styles.delta, { color: "#16A34A" }]}>
              {deltaValue.toFixed(1)} ▲
            </Text>
          )}
          {deltaTrend === "down" && (
            <Text style={[styles.delta, { color: "#DC2626" }]}>
              {deltaValue.toFixed(1)} ▼
            </Text>
          )}
          {deltaTrend === "same" && (
            <Text style={[styles.delta, { color: "#6B7280" }]}>
              {deltaValue.toFixed(1)} ＝
            </Text>
          )}
        </View>
        {discountMsg && <Text style={styles.discountInfo}>{discountMsg}</Text>}
        {/* 💰 Скидка для авторизованных */}
        {canShowDiscount() && (
          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>
              {mode === "buy" ? "С 5% скидкой:" : "С наценкой 5%:"}
            </Text>

            <Text style={[styles.discountValue, { color: "#16A34A" }]}>
              {(computed.from - discountValue).toLocaleString("ru-RU", {
                maximumFractionDigits: 2,
              })}{" "}
              ₸
            </Text>
          </View>
        )}

        {/* Guest phone */}
        {isGuest && (
          <View
            style={{
              marginTop: 20,
              borderTopWidth: 1,
              borderTopColor: BORDER,
            }}
          >
            <View style={{ marginTop: 20 }}>
              <Text style={styles.subtitle}>
                Оставьте номер телефона, на который хотите оформить бронь
              </Text>
              <MaskInput
                style={styles.input}
                placeholder="+7 (___) ___-__-__"
                keyboardType="number-pad"
                inputMode="numeric"
                autoCorrect={false}
                autoCapitalize="none"
                mask={[
                  "+",
                  "7",
                  " ",
                  "(",
                  /\d/,
                  /\d/,
                  /\d/,
                  ")",
                  " ",
                  /\d/,
                  /\d/,
                  /\d/,
                  "-",
                  /\d/,
                  /\d/,
                  "-",
                  /\d/,
                  /\d/,
                ]}
                value={maskedPhone}
                onChangeText={(masked, unmasked) => {
                  const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
                  setDigits(next);
                  setMaskedPhone(masked);
                }}
                maxLength={19}
              />
            </View>
          </View>
        )}

        {digits.length >= 3 && !validPrefixes.includes(prefix) && (
          <Text style={styles.error}>
            Доступны только коды операторов Казахстана
          </Text>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerTitle}>Итого</Text>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>{"Ваша сумма"}</Text>
          <Text
            style={[
              styles.footerValue,
              {
                writingDirection: "ltr",
                textAlign: "right",
                direction: "ltr", // на Android важно
              },
            ]}
          >
            {displayValue}
          </Text>
        </View>
        <Pressable
          style={[
            styles.cta,
            (isCreating || isCreatingGuest || (isGuest && !isValid)) && {
              opacity: 0.6,
            },
          ]}
          disabled={isCreating || isCreatingGuest || (isGuest && !isValid)}
          onPress={handleCreateBooking}
        >
          <Text style={styles.ctaText}>
            {isCreating || isCreatingGuest ? "Отправка..." : "Забронировать"}
          </Text>
        </Pressable>
      </View>

      {/* Modal выбора валюты */}
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
          flag: <CurrencyFlag code={c.code as CurrencyCode} size={24} />,
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
          onChangeText={(t) => {
            // Убираем все лишние символы, кроме цифр и запятых/точек
            const cleaned = t.replace(/[^\d.,]/g, "");
            // Форматируем с разделением тысяч, если возможно
            const num = Number(cleaned.replace(",", "."));
            const formatted =
              isFinite(num) && cleaned !== ""
                ? num
                    .toLocaleString("ru-RU", { maximumFractionDigits: 2 })
                    .replace(/\u00A0/g, " ")
                : cleaned;
            onChangeText(formatted);
          }}
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
  suffixText: { fontSize: 18, fontWeight: "800", color: TEXT },
  rateRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  rateText: { color: TEXT, fontSize: 14, fontWeight: "400" },
  delta: { marginLeft: 10, fontWeight: "400", fontSize: 14 },
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
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: { color: "#DC2626", marginTop: 6, fontSize: 13 },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  discountLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  discountValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A", // зелёный для акцента
  },
  discountInfo: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280", // SUB
    fontStyle: "italic",
    marginLeft: 2,
  },
});
