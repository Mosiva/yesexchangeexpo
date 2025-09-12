import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const RESEND_DELAY = 60;
const BOX = 52;

export default function SendCodeScreen() {
  const router = useRouter();
  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const phone = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const code = digits.join("");
  const isComplete = code.length === 6;

  // countdown
  const [secondsLeft, setSecondsLeft] = useState(RESEND_DELAY);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    const onlyDigits = text.replace(/\D/g, "");
    const next = [...digits];

    if (onlyDigits.length <= 1) {
      next[index] = onlyDigits;
      setDigits(next);
      if (onlyDigits && index < 5) inputsRef.current[index + 1]?.focus();
      return;
    }
    // paste support
    const chars = onlyDigits.slice(0, 6 - index).split("");
    for (let i = 0; i < chars.length; i++) next[index + i] = chars[i];
    setDigits(next);
    inputsRef.current[Math.min(index + chars.length, 5)]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    if (!isComplete) return;
    try {
      // TODO: verify with backend: await verifyOtp({ phone, code })
      router.replace("/(tabs)/(main)");
    } catch {
      Alert.alert("Ошибка", "Неверный код, попробуйте ещё раз");
    }
  };

  const formatPhone = (p: string) =>
    p.startsWith("+7") && p.length === 12
      ? `+7 (${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8, 10)}-${p.slice(
          10,
          12
        )}`
      : p;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.helperText}>
        Код отправлен на{" "}
        <Text style={styles.helperEmail}>{formatPhone(phone)}</Text>
      </Text>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            style={styles.otpBox}
            value={d}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={1}
            textAlign="center"
            placeholder="-"
            placeholderTextColor="#9CA3AF"
            returnKeyType={i === 5 ? "done" : "next"}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !isComplete && styles.buttonDisabled]}
        disabled={!isComplete}
        onPress={handleContinue}
      >
        <Text
          style={[styles.buttonText, !isComplete && styles.buttonTextDisabled]}
        >
          Потвердить код
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => secondsLeft === 0 && setSecondsLeft(RESEND_DELAY)}
        disabled={secondsLeft > 0}
        style={{ marginTop: 12 }}
      >
        {secondsLeft > 0 ? (
          <Text style={styles.resendText}>
            Отправить код через {`00:${String(secondsLeft).padStart(2, "0")}`}
          </Text>
        ) : (
          <Text style={[styles.resendText, styles.resendActive]}>
            Отправить код
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  helperText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  helperEmail: { color: "#111827", fontWeight: "700" },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBox: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    fontSize: 20,
  },
  button: {
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F58220",
  },
  buttonDisabled: { backgroundColor: "#E5E7EB" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonTextDisabled: { color: "#9CA3AF" },
  resendText: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  resendActive: { color: "#180F4D" },
});
