import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CalendarPicker from "react-native-calendar-picker";

interface DateRangePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (range: {
    fromIso: string;
    toIso: string;
    fromDisplay: string;
    toDisplay: string;
  }) => void;
  allowPastDates?: boolean;
}

export const DateRangePickerModal = ({
  isVisible,
  onClose,
  onConfirm,
  allowPastDates = false,
}: DateRangePickerModalProps) => {
  const { t } = useTranslation();
  const months = t("datepicker.months", { returnObjects: true }) as string[];
  const days = t("datepicker.days", { returnObjects: true }) as string[];

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // 📅 выбор даты
  const handleDateChange = (date: Date | null, type: string) => {
    if (!date) return;

    // 🔁 если нажали ту же дату — сбрасываем всё
    if (
      (fromDate && date.toDateString() === fromDate.toDateString()) ||
      (toDate && date.toDateString() === toDate.toDateString())
    ) {
      setFromDate(null);
      setToDate(null);
      return;
    }

    if (type === "END_DATE") {
      if (!fromDate) return;

      const diffDays =
        Math.abs(date.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 31) {
        Alert.alert(
          "Ограничение",
          "Вы можете выбрать период не более 1 месяца"
        );
        return;
      }

      setToDate(date);
    } else {
      setFromDate(date);
      setToDate(null);
    }
  };

  const handleConfirm = () => {
    if (!fromDate || !toDate) return;

    const format = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${d.getFullYear()}`;

    onConfirm({
      fromIso: fromDate.toISOString(),
      toIso: toDate.toISOString(),
      fromDisplay: format(fromDate),
      toDisplay: format(toDate),
    });
    onClose();
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Заголовок + кнопка сброса */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Выберите период</Text>
            {(fromDate || toDate) && (
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Сбросить</Text>
              </TouchableOpacity>
            )}
          </View>

          <CalendarPicker
            allowRangeSelection
            onDateChange={handleDateChange}
            selectedStartDate={fromDate || undefined}
            selectedEndDate={toDate || undefined}
            weekdays={days}
            months={months}
            previousTitle={t("datepicker.previous")}
            nextTitle={t("datepicker.next")}
            todayBackgroundColor="#F3F4F6"
            selectedDayColor="#F58220"
            selectedDayTextColor="#FFFFFF"
            selectedRangeStartStyle={{ backgroundColor: "#F58220" }}
            selectedRangeEndStyle={{ backgroundColor: "#F58220" }}
            selectedRangeStyle={{ backgroundColor: "#FBD38D" }}
            textStyle={{ color: "#111827", fontWeight: "600" }}
            {...(allowPastDates
              ? {
                  // ✅ разрешаем только прошлые даты, но не сегодня
                  maxDate: (() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return fromDate
                      ? new Date(
                          Math.min(
                            yesterday.getTime(),
                            fromDate.getTime() + 31 * 24 * 60 * 60 * 1000
                          )
                        )
                      : yesterday;
                  })(),
                }
              : {
                  // будущее — только начиная с завтрашнего дня
                  minDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  maxDate: fromDate
                    ? new Date(fromDate.getTime() + 31 * 24 * 60 * 60 * 1000)
                    : undefined,
                })}
          />

          {/* Кнопки */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Отмена
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={handleConfirm}
              disabled={!fromDate || !toDate}
            >
              <Text style={styles.buttonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  resetText: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: "700",
  },
  button: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    flex: 1,
  },
  cancelButtonText: {
    color: "#111827",
  },
});
