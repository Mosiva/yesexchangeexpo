import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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
import { useAuth } from "../../../../providers/Auth";
type Params = {
  id?: string; // "№12356"
  kind?: string; // "Без привязки к курсу"
  amount?: string; // "1000"
  currency?: string; // "USD"
  rateText?: string; // "1 KZT = 0,001861123 USD"
  address?: string; // "Астана, Аэропорт"
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

  // Fallbacks to match the screenshot
  const id = p.id ?? "00000";
  const kind = p.kind ?? "Без привязки к курсу";
  const amount = p.amount ?? "1000";
  const currency = p.currency ?? "USD";
  const rateText = p.rateText ?? "1 KZT = 0,001861123 USD";
  const address = p.address ?? "Астана, Аэропорт";

  const cancelBooking = () => {
    Alert.alert(
      "Отменить бронь?",
      "Заявка будет отменена и вернётся в список.",
      [
        { text: "Нет", style: "cancel" },
        {
          text: "Да, отменить",
          style: "destructive",
          onPress: () => {
            // TODO: call API to cancel
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>
          Ваша бронь находится на модерации,{"\n"}ожидайте
        </Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Заявка №{id}</Text>
          <Text style={styles.cardSub}>{kind}</Text>

          <View style={{ height: 16 }} />

          <Row label="Сумма брони:" value={`${amount} ${currency}`} big />
          <View style={{ height: 10 }} />
          <Row label="По курсу:" value={rateText} />
          <View style={{ height: 10 }} />
          <Row label="Адрес:" value={address} />
          {!isGuest && (
            <TouchableOpacity style={styles.dangerBtn} onPress={cancelBooking}>
              <Text style={styles.dangerText}>Отменить бронь</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/(tabs)/(main)")}
        >
          <Text style={styles.primaryText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ——— Small row subcomponent ——— */
function Row({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text style={styles.rowLabel}>{label} </Text>
      <Text style={[styles.rowValue, big && styles.rowValueBig]}>{value}</Text>
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
  rowValueBig: { fontSize: 18, fontWeight: "700" },

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
});
