import React, { useMemo, useState } from "react";
import {
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
import { useBookingsHistoryQuery } from "../../../../services/yesExchange";

export default function ReserveHistoryRScreen() {
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

  /** === Transform API data === */
  const items: Reservation[] = useMemo(() => {
    if (!rawBookings?.data) return [];
    return rawBookings.data.map((b: any) => ({
      id: Number(b.id),
      date: b.createdAt,
      amount: Number(b.amount),
      currency: b.fromExchangeRate?.currency?.code ?? "KZT",
      address: b.branch?.address ?? "—",
      status:
        b.status === "pending"
          ? "pending"
          : b.status === "completed" || b.status === "received"
          ? "received"
          : "rejected",
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

  const confirmCancel = () => {
    if (selectedIdx !== null) {
      console.log("Отменяем бронь", items[selectedIdx].id);
    }
    setShowCancelModal(false);
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
