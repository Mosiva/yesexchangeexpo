import React, { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import CancelReservationModal from "../../../../components/CancelReservationModal";
import ReservationCard, {
  Reservation,
} from "../../../../components/ReservationCard";

// ---- Demo data (замени на данные из API) ----
const initialData: Reservation[] = [
  {
    id: 12356,
    date: "2025-08-11",
    amount: 1000,
    currency: "USD",
    address: "Астана, Аэропорт",
    status: "pending",
  },
  {
    id: 12357,
    date: "2025-08-11",
    amount: 1000,
    currency: "USD",
    address: "Астана, Аэропорт",
    status: "received",
  },
  {
    id: 12358,
    date: "2025-08-11",
    amount: 1000,
    currency: "USD",
    address: "Астана, Аэропорт",
    status: "rejected",
  },
];

export default function ReserveHistoryScreen() {
  const [items, setItems] = useState<Reservation[]>(initialData);
  const [refreshing, setRefreshing] = useState(false);

  // modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: fetch from API
    await new Promise((r) => setTimeout(r, 700));
    setRefreshing(false);
  };

  const handleCancel = (idx: number) => {
    setSelectedIdx(idx);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (selectedIdx !== null) {
      setItems((prev) =>
        prev.map((it, i) =>
          i === selectedIdx ? { ...it, status: "rejected" } : it
        )
      );
    }
    setShowCancelModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" /> 
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {items.map((it, idx) => (
          <ReservationCard
            key={`${it.id}-${it.status}`}
            data={it}
            onCancel={() => handleCancel(idx)}
          />
        ))}
      </ScrollView>

      <CancelReservationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
