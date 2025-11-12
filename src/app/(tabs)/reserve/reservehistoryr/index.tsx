import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CancelReservationModal from "../../../../components/CancelReservationModal";
import ReservationCard, {
  Reservation,
} from "../../../../components/ReservationCard";
import { Skeleton } from "../../../../components/skeleton";
import { useTheme } from "../../../../hooks/useTheme";
import {
  useBookingsQuery,
  useCancelBookingMutation,
} from "../../../../services/yesExchange";

export default function ReserveHistoryRScreen() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const s = makeStyles(colors);

  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  /** === API === */
  const {
    data: rawBookings,
    refetch: refetchBookings,
    isFetching,
    isError,
  } = useBookingsQuery({ page: 1, limit: 100 });

  const [doCancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation({});

  // === Обновление данных ===
  const refetchAllData = useCallback(async () => {
    await Promise.all([refetchBookings()]);
  }, [refetchBookings]);

  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  /** === Transform API data === */
  const items: Reservation[] = useMemo(() => {
    if (!rawBookings?.data) return [];
    return rawBookings.data.map((b: any) => ({
      id: Number(b.id),
      date: b.createdAt,
      amount: Number(b.amount),
      currency: b.fromExchangeRate?.currency?.code,
      address: b.branch?.address ?? "—",
      operationType: b.operationType ?? "—",
      number: b.number,
      status: (b.status ?? "created") as
        | "created"
        | "pending_moderation"
        | "not_confirmed"
        | "ready_for_pickup"
        | "cancelled"
        | "expired"
        | "received"
        | "sync_failed"
        | "external_deleted",
    }));
  }, [rawBookings]);

  /** === Refresh === */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBookings();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = (idx: number) => {
    setSelectedIdx(idx);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (selectedIdx === null) return;
    setShowCancelModal(false);
    try {
      const bookingId = Number(items[selectedIdx].id);
      await doCancelBooking({ id: bookingId }).unwrap();
      Alert.alert(
        t("reserve.success", "Успешно"),
        t("reserve.successMessage", "Бронь успешно отменена."),
        [{ text: t("reserve.ok", "ОК"), onPress: () => refetchBookings() }]
      );
    } catch (err: any) {
      console.error("❌ Cancel booking error:", err);
      Alert.alert(
        t("reserve.error", "Ошибка"),
        err?.data?.message ||
          err?.error ||
          t("reserve.errorMessage", "Не удалось отменить бронь.")
      );
    }
  };

  /** === Render states === */
  const renderSkeletons = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={s.skeletonCard}>
          <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} style={{ marginBottom: 14 }} />
          <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
          <Skeleton width="70%" height={14} style={{ marginBottom: 14 }} />
          <Skeleton width="100%" height={52} borderRadius={14} />
        </View>
      ))}
    </View>
  );

  const renderError = () => (
    <View style={s.errorWrap}>
      <Text style={s.errorText}>
        {t("reserve.errorMessage", "Не удалось загрузить данные 😞")}
      </Text>
      <TouchableOpacity style={s.retryBtn} onPress={() => refetchBookings()}>
        <Text style={s.retryText}>{t("reserve.retry", "Повторить")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />

      {isFetching && renderSkeletons()}
      {!isFetching && isError && renderError()}

      {!isFetching && !isError && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {items.length === 0 ? (
            <Text style={s.emptyText}>
              {t("reserve.emptyMessage", "Пока нет броней")}
            </Text>
          ) : (
            items.map((it, idx) => (
              <ReservationCard
                key={`${it.id}-${it.status}`}
                data={it}
                onCancel={() => handleCancel(idx)}
              />
            ))
          )}
        </ScrollView>
      )}

      <CancelReservationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        isLoading={isCancelling}
      />
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    skeletonCard: {
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      backgroundColor: colors.card,
    },
    errorWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      marginTop: 100,
    },
    errorText: {
      color: colors.subtext,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    retryText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
    emptyText: {
      color: colors.subtext,
      textAlign: "center",
      fontSize: 16,
      marginTop: 100,
    },
  });
