import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CancelReservationModal from "../../../../components/CancelReservationModal";
import { useAuth } from "../../../../providers/Auth";
import { useCancelBookingMutation } from "../../../../services/yesExchange";

type Params = {
  id?: string; // "№12356"
  kind?: string; // "Без привязки к курсу"
  amount?: string; // "1000"
  currency?: string; // "USD"
  rateText?: string; // "1 KZT = 0,001861123 USD"
  address?: string; // "Астана, Аэропорт"
  phone?: string; // "+77777777777"
  isNoRate?: string; // true
  bitrixId?: string; // "00000"
};

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  sub: "#6B7280",
  border: "#ECECEC",
  bg: "#FFFFFF",
  card: "#F9FAFB",
};

export default function ModerationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<Params>();
  const { isGuest } = useAuth();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [doCancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation({});

  // Fallbacks
  const id = p.id ?? "00000";
  const kind = p.kind ?? "Без привязки к курсу";
  const amount = p.amount ?? "1000";
  const currency = p.currency ?? "USD";
  const rateText = p.rateText ?? "1 KZT = 0,001861123 USD";
  const address = p.address ?? "Астана, Аэропорт";
  const isNoRate = p.isNoRate ?? false;
  const bitrixId = p.bitrixId ?? "00000";
  /** 🔄 Подтверждение отмены брони */
  const confirmCancel = async () => {
    setShowCancelModal(false);

    try {
      if (isGuest) {
        await doCancelBooking({
          id: Number(id),
        }).unwrap();
      } else {
        await doCancelBooking({
          id: Number(id),
        }).unwrap();
      }

      router.replace("/(tabs)/reserve"); // возвращаем пользователя в список
    } catch (err: any) {
      console.error("❌ Cancel booking error:", err);
      Alert.alert(
        "Ошибка",
        err?.data?.message || err?.error || "Не удалось отменить бронь"
      );
    }
  };
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>
          Заявка принята в работу, ожидайте звонка от нашего специалиста
        </Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Заявка №{bitrixId}</Text>
          <Text style={styles.cardSub}>{kind}</Text>

          <View style={{ height: 16 }} />

          <Row label="Сумма брони:" value={`${amount} ${currency}`} big />
          <View style={{ height: 10 }} />
          <Row label="По курсу:" value={rateText}>
            {isNoRate && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Info icon + tooltip */}
                <TouchableOpacity
                  onPress={() => setShowTooltip(!showTooltip)}
                  hitSlop={7}
                  style={{ marginLeft: 1, paddingBottom: 2 }}
                >
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={"#727376"}
                    style={{ marginTop: 2 }}
                  />
                </TouchableOpacity>

                {showTooltip && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>
                      Курс на момент создания заявки
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Row>
          <View style={{ height: 10 }} />
          <Row label="Адрес:" value={address} />

          {/* Отменить бронь (только если не гость) */}
          {!isGuest && (
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.dangerText}>Отменить бронь</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Модалка подтверждения отмены */}
      <CancelReservationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        isLoading={isCancelling}
      />
    </View>
  );
}

/* ——— Small row subcomponent ——— */
function Row({
  label,
  value,
  big,
  children,
}: {
  label: string;
  value: string;
  big?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}
    >
      <Text style={styles.rowLabel}>{label} </Text>
      <Text
        style={[
          styles.rowValue,
          big && styles.rowValueBig,
          { flexWrap: "wrap" },
        ]}
      >
        {value}
      </Text>

      {children && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {children}
        </View>
      )}
    </View>
  );
}

/* ——— Styles ——— */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16 },
  lead: {
    fontSize: 16,
    lineHeight: 28,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: "400",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  cardSub: { marginTop: 6, color: COLORS.sub, fontSize: 12 },
  rowLabel: { color: COLORS.sub, fontSize: 12 },
  rowValue: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  rowValueBig: { fontSize: 12, fontWeight: "700" },
  dangerBtn: {
    marginTop: 16,
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },
  primaryBtn: {
    backgroundColor: COLORS.orange,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // tooltip bubble
  tooltip: {
    position: "absolute",
    top: -40, // above the row
    left: -100,
    backgroundColor: "#35353599",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 5,
  },
  tooltipText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
