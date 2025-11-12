import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export type Status =
  | "created"
  | "pending_moderation"
  | "not_confirmed"
  | "ready_for_pickup"
  | "cancelled"
  | "expired"
  | "received"
  | "sync_failed"
  | "external_deleted";

export type Reservation = {
  id: number;
  date: string;
  amount: number;
  currency: string;
  address: string;
  status: Status;
  number: string;
};

export default function ReservationCard({
  data,
  onCancel,
}: {
  data: Reservation;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const s = makeStyles(colors);
  const { date, amount, currency, address, status, number } = data;
  const prettyDate = toDDMMYYYY(date);

  const isPending = status === "pending_moderation";

  return (
    <View style={[s.card, isPending && s.cardPending]}>
      {/* title + status */}
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>
          {t("reserve.applicationNumber", "Заявка №")}
          {number}
        </Text>
        <StatusPill status={status} />
      </View>
      <Text style={s.cardDate}>{prettyDate}</Text>

      {/* amount */}
      <View style={s.row}>
        <Text style={s.rowLabel}>
          {t("reserve.bookingAmount", "Сумма брони")}:
        </Text>
        <Text style={s.amountText}>
          {amount} {currency}
        </Text>
      </View>

      {/* address */}
      <View style={[s.row, { marginTop: 6 }]}>
        <Text style={s.rowLabel}>{t("reserve.address", "Адрес")}:</Text>
        <Text style={s.rowValue}>{address}</Text>
      </View>

      {/* cancel */}
      {isPending && (
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
          <Text style={s.cancelBtnText}>
            {t("reserve.cancelReservation", "Отменить бронь")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatusPill({ status }: { status: Status }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const map: Record<Status, { icon: any; color: string; text: string }> = {
    created: {
      icon: "time-outline",
      color: colors.subtext,
      text: t("reserve.created", "Создана"),
    },
    pending_moderation: {
      icon: "hourglass-outline",
      color: colors.subtext,
      text: t("reserve.onModeration", "На модерации"),
    },
    not_confirmed: {
      icon: "help-circle-outline",
      color: "#EAB308",
      text: t("reserve.notConfirmed", "Не подтверждена"),
    },
    ready_for_pickup: {
      icon: "checkmark-done-circle-outline",
      color: "#2563EB",
      text: t("reserve.readyForPickup", "Готова к выдаче"),
    },
    cancelled: {
      icon: "close-circle-outline",
      color: "#DC2626",
      text: t("reserve.cancelled", "Отменена"),
    },
    expired: {
      icon: "alert-circle-outline",
      color: colors.subtext,
      text: t("reserve.expired", "Истекла"),
    },
    received: {
      icon: "checkmark-circle",
      color: "#16A34A",
      text: t("reserve.received", "Получено"),
    },
    sync_failed: {
      icon: "cloud-offline-outline",
      color: "#F87171",
      text: t("reserve.syncFailed", "Ошибка синхронизации"),
    },
    external_deleted: {
      icon: "trash-outline",
      color: colors.subtext,
      text: t("reserve.externalDeleted", "Удалена внешне"),
    },
  };

  const item =
    map[status] ??
    ({
      icon: "alert-circle-outline",
      color: colors.subtext,
      text: t("reserve.unknown", "Неизвестно"),
    } as const);

  return (
    <View style={styles.pill}>
      <Ionicons name={item.icon} size={18} color={item.color} />
      <Text style={[styles.pillText, { color: item.color }]}>{item.text}</Text>
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

const makeStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      backgroundColor: colors.background,
    },
    cardPending: {
      backgroundColor: colors.backgroundAlt ?? colors.card,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    cardDate: {
      color: colors.subtext,
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
      color: colors.subtext,
      fontSize: 12,
      fontWeight: "400",
    },
    rowValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "400",
      marginLeft: 10,
      flexShrink: 1,
    },
    amountText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginLeft: 10,
    },
    cancelBtn: {
      backgroundColor: colors.primary,
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

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "400",
  },
});
