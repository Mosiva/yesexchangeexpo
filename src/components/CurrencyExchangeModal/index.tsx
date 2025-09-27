import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    InputAccessoryView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";

type ConfirmPayload = { sell: number; receive: number };

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload?: ConfirmPayload) => void;

  /** Покупка или продажа */
  mode?: "buy" | "sell";

  fromCode?: string;
  fromName?: string;
  toCode?: string;
  rate?: number;
  fromSymbol?: string;
  toSymbol?: string;
  flagEmoji?: string;
}

const ACCESSORY_ID = "hide-ios-done-toolbar";

export default function CurrencyExchangeModal({
  visible,
  onClose,
  onConfirm,
  mode = "sell",
  fromCode = "RUB",
  fromName = "Российский рубль",
  toCode = "KZT",
  rate = 535.8,
  fromSymbol = "₽",
  toSymbol = "₸",
  flagEmoji = "🇷🇺",
}: Props) {
  const [sellText, setSellText] = useState<string>("1");
  const sell = Number(sellText.replace(",", "."));
  const receive = useMemo(
    () => (isFinite(sell) ? sell * rate : 0),
    [sell, rate]
  );

  const receiveText = useMemo(() => formatNum(receive), [receive]);

  const canConfirm = isFinite(sell) && sell > 0;

  // динамические подписи
  const title = mode === "sell" ? "Продажа" : "Покупка";
  const inputLabel = mode === "sell" ? "Продать" : "Купить";
  const ctaLabel = "Забронировать";

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={250}
      animationOutTiming={250}
      avoidKeyboard
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Currency row */}
          <View style={styles.cardRow}>
            <View style={styles.left}>
              <View style={styles.flagCircle}>
                <Text style={{ fontSize: 20 }}>{flagEmoji}</Text>
              </View>
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

          {/* Inputs */}
          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{inputLabel}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={sellText}
                  onChangeText={(t) => setSellText(t.replace(/[^\d.,]/g, ""))}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  style={styles.input}
                  placeholder="0"
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? ACCESSORY_ID : undefined
                  }
                />
                <View style={styles.suffix}>
                  <Text style={styles.suffixText}>{fromSymbol}</Text>
                </View>
              </View>
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Получить</Text>
              <View style={[styles.inputWrap, { opacity: 0.9 }]}>
                <TextInput
                  editable={false}
                  value={receiveText}
                  style={styles.input}
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? ACCESSORY_ID : undefined
                  }
                />
                <View style={styles.suffix}>
                  <Text style={styles.suffixText}>{toSymbol}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, !canConfirm && styles.ctaDisabled]}
            disabled={!canConfirm}
            onPress={() => onConfirm({ sell, receive })}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>

          {/* Empty accessory view to HIDE iOS grey "Done" bar */}
          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={ACCESSORY_ID}>
              <View style={{ height: 0 }} />
            </InputAccessoryView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* Helpers */
function formatNum(n: number) {
  if (!isFinite(n)) return "";
  return n
    .toLocaleString("ru-RU", { maximumFractionDigits: 2 })
    .replace(/\u00A0/g, " ");
}

/* Styles */
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
    maxHeight: "85%",
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
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: { fontSize: 20, fontWeight: "800", color: "#111827" },
  nameText: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  right: { alignItems: "flex-end" },
  rateText: { fontSize: 22, fontWeight: "800", color: "#111827" },
  rateHint: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  inputsRow: { flexDirection: "row", marginBottom: 16 },
  label: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
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
    marginLeft: 8,
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
