import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { CurrencyCode } from "../../types/api";
import { getCurrencySymbol } from "../../utils/currency";
import CurrencyFlag from "../CurrencyFlag";

type ConfirmPayload = { sell: number; receive: number };

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload?: ConfirmPayload) => void;
  mode?: "buy" | "sell";
  fromCode?: string;
  fromName?: string;
  toCode?: string;
  rate?: number;
  fromSymbol?: string;
  toSymbol?: string;
  /** 👇 добавляем */
  branchId?: number;
  address?: string;
}

export default function CurrencyExchangeModal({
  visible,
  onClose,
  onConfirm,
  mode = "sell",
  fromCode = "RUB",
  fromName = "Российский рубль",
  rate = 535.8,
  fromSymbol = "₽",
  toSymbol = "₸",
  branchId,
  address,
}: Props) {
  const router = useRouter();

  const [sellText, setSellText] = useState<string>("1");
  const sell = Number(sellText.replace(",", "."));
  const receive = useMemo(
    () => (isFinite(sell) ? sell * rate : 0),
    [sell, rate]
  );

  const receiveText = useMemo(() => formatNum(receive), [receive]);
  const canConfirm = isFinite(sell) && sell > 0;

  const title = mode === "sell" ? "Продажа" : "Покупка";
  const inputLabel = mode === "sell" ? "Продать" : "Купить";
  const outputLabel = mode === "sell" ? "Получить" : "Отдать";
  const ctaLabel = "Забронировать";

  const fromCurrSymbol = getCurrencySymbol(fromCode as CurrencyCode);

  const handleConfirm = () => {
    const payload = { sell, receive };

    // 👇 Исправляем передачу параметров в зависимости от режима
    const sellAmount =
      mode === "sell" ? String(payload.receive) : String(payload.sell);
    const receiveAmount =
      mode === "sell" ? String(payload.sell) : String(payload.receive);

    onConfirm(payload);
    onClose();

    router.push({
      pathname: "/(stacks)/norates/withrates",
      params: {
        mode: mode === "sell" ? "buy" : "sell",
        fromCode,
        fromName,
        rate: String(rate),
        id: branchId ? String(branchId) : "",
        address: address ?? "",
        sellAmount,
        receiveAmount,
      },
    });
  };
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => setTimeout(onClose, 50)}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={250}
      animationOutTiming={250}
      avoidKeyboard
      useNativeDriver={false}
      backdropColor="rgba(0,0,0,0.4)"
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.left}>
              <CurrencyFlag code={fromCode as CurrencyCode} size={28} />
              <View>
                <Text style={styles.codeText}>{fromCode}</Text>
                <Text style={styles.nameText}>{fromName}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.rateText}>{formatNum(rate)}</Text>
              <Text style={styles.rateHint}>По курсу</Text>
            </View>
          </View>

          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{inputLabel}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={sellText}
                  onChangeText={(t) => setSellText(t.replace(/[^\d.,]/g, ""))}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholder="0"
                />
                <View style={styles.suffix}>
                  <Text style={styles.suffixText}>{fromCurrSymbol}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{outputLabel}</Text>
              <View style={[styles.inputWrap, { opacity: 0.9 }]}>
                <TextInput
                  editable={false}
                  value={receiveText}
                  style={styles.input}
                />
                <View style={styles.suffix}>
                  <Text style={styles.suffixText}>{toSymbol}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.cta, !canConfirm && styles.ctaDisabled]}
            disabled={!canConfirm}
            onPress={handleConfirm}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatNum(n: number) {
  if (!isFinite(n)) return "";
  return n
    .toLocaleString("ru-RU", { maximumFractionDigits: 2 })
    .replace(/\u00A0/g, " ");
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E9ECEF",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  codeText: { fontSize: 16, fontWeight: "400", color: "#111827" },
  nameText: { fontSize: 12, color: "#6B7280" },
  right: { alignItems: "flex-end" },
  rateText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  rateHint: { fontSize: 12, color: "#6B7280" },
  inputsRow: { flexDirection: "row", marginBottom: 16 },
  label: { fontSize: 14, color: "#111827", marginBottom: 8 },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 18, color: "#111827" },
  suffix: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    height: "100%",
  },
  suffixText: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cta: {
    backgroundColor: "#F58220",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
