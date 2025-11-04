import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CalendarPicker from "react-native-calendar-picker";

export interface DateRangePickerModalRef {
  reset: () => void;
}

interface Props {
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

export const DateRangePickerModal = forwardRef<DateRangePickerModalRef, Props>(
  ({ isVisible, onClose, onConfirm, allowPastDates = false }, ref) => {
    const { t } = useTranslation();
    const months = t("datepicker.months", { returnObjects: true }) as string[];
    const days = t("datepicker.days", { returnObjects: true }) as string[];

    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    // 👉 публичный reset(), вызывается из FxLineChart
    useImperativeHandle(ref, () => ({
      reset: () => {
        setFromDate(null);
        setToDate(null);
      },
    }));

    // 🌀 Анимации появления
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      if (isVisible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      }
    }, [isVisible]);

    // 🗓️ обработка выбора даты
    const handleDateChange = (date: Date | null, type: string) => {
      if (!date) return;

      // если пользователь нажал ту же дату — сбрасываем
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
          setFromDate(null);
          setToDate(null);
          return;
        }
        setToDate(date);
      } else {
        setFromDate(date);
        setToDate(null);
      }
    };

    // ✅ Применить выбранный диапазон
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

    // 🔄 Локальный сброс (только внутри календаря)
    const handleReset = () => {
      setFromDate(null);
      setToDate(null);
    };

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* --- Заголовок --- */}
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Выберите период</Text>
              {(fromDate || toDate) && (
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetText}>Сбросить</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* --- Календарь --- */}
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
                    // ❌ исключаем сегодня, можно выбирать до вчерашнего
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
                    // ✅ выбор только будущих дат
                    minDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    maxDate: fromDate
                      ? new Date(fromDate.getTime() + 31 * 24 * 60 * 60 * 1000)
                      : undefined,
                  })}
            />

            {/* --- Кнопки --- */}
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
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  overlay: {
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
DateRangePickerModal.displayName = "DateRangePickerModal";
