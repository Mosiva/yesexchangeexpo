import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { height } = Dimensions.get("window");
const ORANGE = "#F58220";

export default function CancelReservationModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} onPress={onClose} />
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Отмена брони</Text>
          <Text style={styles.subtitle}>
            Вы уверены, что хотите отменить бронь?
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Да</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayBg: {
    flex: 1,
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  confirmBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "black",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
