import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTranslation } from "react-i18next";
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

  const handleDateChange = (date: Date | null, type: string) => {
    if (type === "END_DATE") {
      setToDate(date);
    } else {
      setFromDate(date);
      setToDate(null); // сбрасываем старый конец диапазона
    }
  };

  const handleConfirm = () => {
    if (!fromDate || !toDate) return;

    const format = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${d.getFullYear()}`;

    const fromIso = fromDate.toISOString();
    const toIso = toDate.toISOString();

    onConfirm({
      fromIso,
      toIso,
      fromDisplay: format(fromDate),
      toDisplay: format(toDate),
    });
    onClose();
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
          <Text style={styles.modalTitle}>Выберите период</Text>

          <CalendarPicker
            allowRangeSelection={true}
            onDateChange={handleDateChange}
            selectedStartDate={fromDate || undefined}
            selectedEndDate={toDate || undefined}
            weekdays={days}
            months={months}
            previousTitle={t("datepicker.previous")}
            nextTitle={t("datepicker.next")}
            todayBackgroundColor="#F3F4F6" // фон сегодняшнего дня
            selectedDayColor="#F58220" // 🔥 основной цвет выделенного дня
            selectedDayTextColor="#FFFFFF" // цвет текста внутри выделенного дня
            selectedRangeStartStyle={{ backgroundColor: "#F58220" }} // начало диапазона
            selectedRangeEndStyle={{ backgroundColor: "#F58220" }} // конец диапазона
            selectedRangeStyle={{ backgroundColor: "#FBD38D" }} // фон внутри диапазона (между start и end)
            textStyle={{ color: "#111827", fontWeight: "600" }} // цвет текста всех дат
            {...(allowPastDates
              ? { maxDate: new Date() }
              : { minDate: new Date(Date.now() + 24 * 60 * 60 * 1000) })}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
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
});
