import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
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
import {
  useBookingsHistoryQuery,
  useCancelBookingMutation,
} from "../../../../services/yesExchange";

export default function ReserveHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  /** === API === */
  const {
    data: rawBookings,
    refetch: refetchBookings,
    isFetching,
    isError,
  } = useBookingsHistoryQuery({
    page: 1,
    limit: 100,
  });
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

    return rawBookings.data.map((b: any) => {
      const operationType = b.operationType ?? "—";

      const currency = b.fromExchangeRate?.currency?.code ?? "Not found";

      return {
        id: Number(b.id),
        date: b.createdAt,
        amount: Number(b.amount),
        currency,
        address: b.branch?.address ?? "—",
        operationType,
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
      };
    });
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

      Alert.alert("Успешно", "Бронь успешно отменена.", [
        { text: "ОК", onPress: () => refetchBookings() },
      ]);
    } catch (err: any) {
      console.error("❌ Cancel booking error:", err);
      Alert.alert(
        "Ошибка",
        err?.data?.message || err?.error || "Не удалось отменить бронь."
      );
    }
  };
  /** === Render states === */
  const renderSkeletons = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
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
    <View style={styles.errorWrap}>
      <Text style={styles.errorText}>Не удалось загрузить данные 😞</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() => refetchBookings()}
      >
        <Text style={styles.retryText}>Повторить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {isFetching && renderSkeletons()}

      {!isFetching && isError && renderError()}

      {!isFetching && !isError && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет броней</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  skeletonCard: {
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    backgroundColor: "#FFF",
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 100,
  },
  errorText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#F58220",
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
    color: "#6B7280",
    textAlign: "center",
    fontSize: 16,
    marginTop: 100,
  },
});
