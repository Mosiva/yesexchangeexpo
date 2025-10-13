import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean; // 👈 для индикации "Отмена..."
}

export default function CancelReservationModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={250}
      animationOutTiming={250}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Шторка */}
          <View style={styles.handle} />

          {/* Заголовок + крестик */}
          <View style={styles.header}>
            <Text style={styles.title}>Отмена брони</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>
            Вы уверены, что хотите отменить бронь?
          </Text>

          {/* Кнопки */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Нет</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isLoading && { opacity: 0.6 }]}
              onPress={!isLoading ? onConfirm : undefined}
              disabled={isLoading}
            >
              <Text style={styles.confirmText}>
                {isLoading ? "Отмена..." : "Да"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ——— Styles ——— */
const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E9ECEF",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    backgroundColor: "#F58220", // 👈 бренд-оранжевый
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
