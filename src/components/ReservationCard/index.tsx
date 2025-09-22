import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type Status = "pending" | "received" | "rejected";

export type Reservation = {
  id: number;
  date: string;
  amount: number;
  currency: string;
  address: string;
  status: Status;
};

export default function ReservationCard({
  data,
  onCancel,
}: {
  data: Reservation;
  onCancel?: () => void;
}) {
  const { id, date, amount, currency, address, status } = data;
  const prettyDate = toDDMMYYYY(date);

  const isPending = status === "pending";
  const bg = isPending ? "#F6F7F9" : "#FFFFFF";

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      {/* title + status */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Заявка №{id}</Text>
        <StatusPill status={status} />
      </View>
      <Text style={styles.cardDate}>{prettyDate}</Text>

      {/* amount */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Сумма брони:</Text>
        <Text style={styles.amountText}>
          {amount} {currency}
        </Text>
      </View>

      {/* address */}
      <View style={[styles.row, { marginTop: 6 }]}>
        <Text style={styles.rowLabel}>Адрес:</Text>
        <Text style={styles.rowValue}>{address}</Text>
      </View>

      {/* cancel */}
      {isPending && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Отменить бронь</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    pending: {
      icon: "time-outline" as const,
      color: "#6B7280",
      text: "На модерации",
    },
    received: {
      icon: "checkmark-circle" as const,
      color: "#16A34A",
      text: "Получено",
    },
    rejected: {
      icon: "alert-circle" as const,
      color: "#DC2626",
      text: "Отклонена",
    },
  }[status];

  return (
    <View style={styles.pill}>
      <Ionicons name={map.icon} size={18} color={map.color} />
      <Text style={[styles.pillText, { color: map.color }]}>{map.text}</Text>
    </View>
  );
}

function toDDMMYYYY(d: string) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  cardDate: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "400",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  rowLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "400",
  },
  rowValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 10,
    flexShrink: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "400",
  },
  cancelBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
