import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CustomBottomSheet, {
    CustomBottomSheetRef,
    CustomBottomSheetView,
} from "../CustomBottomSheet";

const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";

type BranchDetailsProps = {
  branch: {
    id: string;
    title: string;
    address: string;
    worktimeToday: string;
    schedule: { [key: string]: string };
    phone: string;
    email: string;
  } | null;
  onClose: () => void;
};

export default function BranchDetailsSheet({
  branch,
  onClose,
}: BranchDetailsProps) {
  const sheetRef = useRef<CustomBottomSheetRef>(null);
  const snapPoints = useMemo(() => ["70%"], []);

  useEffect(() => {
    if (branch) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [branch]);

  if (!branch) return null;

  return (
    <CustomBottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <CustomBottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{branch.title}</Text>
            <Text style={styles.address}>{branch.address}</Text>
          </View>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={22} color={TEXT} />
          </Pressable>
        </View>

        {/* Gallery placeholder */}
        <View style={styles.galleryRow}>
          <View style={styles.galleryItem} />
          <View style={styles.galleryItem} />
          <View style={styles.galleryItem} />
        </View>

        {/* Worktime */}
        <Text style={styles.workLabel}>Время работы</Text>
        <Text style={styles.workNow}>{branch.worktimeToday}</Text>

        {/* Schedule */}
        <Text style={styles.workLabel}>График</Text>
        {Object.entries(branch.schedule).map(([day, hours]) => (
          <View style={styles.scheduleRow} key={day}>
            <Text style={styles.day}>{day}</Text>
            <Text style={styles.hours}>{hours}</Text>
          </View>
        ))}

        {/* Contacts */}
        <Text style={styles.workLabel}>Контакты</Text>
        <View style={styles.contactRow}>
          <Ionicons name="call" size={18} color={ORANGE} />
          <Text style={styles.contactText}>{branch.phone}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="mail" size={18} color={ORANGE} />
          <Text style={styles.contactText}>{branch.email}</Text>
        </View>

        {/* CTA */}
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Забронировать тут</Text>
        </Pressable>
      </CustomBottomSheetView>
    </CustomBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 60,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
  },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: TEXT },
  address: { color: SUB, marginTop: 4 },
  galleryRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  galleryItem: {
    flex: 1,
    height: 60,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  workLabel: { color: SUB, fontSize: 14, marginTop: 12, marginBottom: 4 },
  workNow: { color: "red", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  scheduleRow: { flexDirection: "row", justifyContent: "space-between" },
  day: { fontWeight: "700", color: TEXT },
  hours: { color: TEXT },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  contactText: { color: TEXT, fontSize: 16 },
  cta: {
    marginTop: 20,
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
