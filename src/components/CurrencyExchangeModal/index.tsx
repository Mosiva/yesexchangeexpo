import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

import { useTheme } from "../../hooks/useTheme";
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [sellText, setSellText] = useState<string>("1");
  const sell = Number(sellText.replace(",", "."));
  const receive = useMemo(
    () => (isFinite(sell) ? sell * rate : 0),
    [sell, rate]
  );

  const receiveText = useMemo(() => formatNum(receive), [receive]);
  const canConfirm = isFinite(sell) && sell > 0;

  const title =
    mode === "sell"
      ? t("currencyExchangeModal.sell", "Продажа")
      : t("currencyExchangeModal.buy", "Покупка");

  const inputLabel =
    mode === "sell"
      ? t("currencyExchangeModal.sellInput", "Продать")
      : t("currencyExchangeModal.buyInput", "Купить");

  const outputLabel =
    mode === "sell"
      ? t("currencyExchangeModal.sellOutput", "Получить")
      : t("currencyExchangeModal.buyOutput", "Отдать");

  const ctaLabel = t("currencyExchangeModal.ctaText", "Забронировать");

  const fromCurrSymbol = getCurrencySymbol(fromCode as CurrencyCode);

  const handleConfirm = () => {
    const payload = { sell, receive };

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
      backdropColor="rgba(0,0,0,0.45)"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.overlay]}
      >
        <View style={[styles.content, { backgroundColor: colors.background}]}>
          <View
            style={[styles.handle, { backgroundColor: colors.border }]}
          />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.cardRow,
              {
                backgroundColor: colors.cardMainCurrencyModal,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.left}>
              <CurrencyFlag code={fromCode as CurrencyCode} size={28} />
              <View>
                <Text style={[styles.codeText, { color: colors.text }]}>
                  {fromCode}
                </Text>
                <Text style={[styles.nameText, { color: colors.subtext }]}>
                  {fromName}
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={[styles.rateText, { color: colors.text }]}>
                {formatNum(rate)}
              </Text>
              <Text style={[styles.rateHint, { color: colors.subtext }]}>
                {t("currencyExchangeModal.rateHint", "По курсу")}
              </Text>
            </View>
          </View>

          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>
                {inputLabel}
              </Text>

              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.cardSecondaryCurrencyModal,
                  },
                ]}
              >
                <TextInput
                  value={sellText}
                  onChangeText={(t) => setSellText(t.replace(/[^\d.,]/g, ""))}
                  keyboardType="decimal-pad"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.subtext}
                />

                <View
                  style={[styles.suffix, { borderLeftColor: colors.border }]}
                >
                  <Text style={[styles.suffixText, { color: colors.text }]}>
                    {fromCurrSymbol}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>
                {outputLabel}
              </Text>

              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.cardSecondaryCurrencyModal,
                  },
                ]}
              >
                <TextInput
                  editable={false}
                  value={receiveText}
                  style={[styles.input, { color: colors.text }]}
                />

                <View
                  style={[styles.suffix, { borderLeftColor: colors.border }]}
                >
                  <Text style={[styles.suffixText, { color: colors.text }]}>
                    {toSymbol}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.cta,
              { backgroundColor: colors.primary },
              !canConfirm && { opacity: 0.5 },
            ]}
            disabled={!canConfirm}
            onPress={handleConfirm}
          >
            <Text style={[styles.ctaText]}>{ctaLabel}</Text>
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
  },

  content: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 20, fontWeight: "700" },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginVertical: 16,
  },

  left: { flexDirection: "row", alignItems: "center", gap: 12 },

  codeText: { fontSize: 16 },
  nameText: { fontSize: 12 },

  right: { alignItems: "flex-end" },
  rateText: { fontSize: 16, fontWeight: "700" },
  rateHint: { fontSize: 12 },

  inputsRow: { flexDirection: "row", marginBottom: 16 },

  label: { fontSize: 14, marginBottom: 8 },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    fontSize: 18,
  },

  suffix: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    borderLeftWidth: 1,
    height: "100%",
  },

  suffixText: { fontSize: 18, fontWeight: "700" },

  cta: {
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
