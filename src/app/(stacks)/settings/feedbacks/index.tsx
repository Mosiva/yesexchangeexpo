import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedbacksScreen() {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(""); // national 10 digits after +7
  const [maskedPhone, setMaskedPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const nameOk = fullName.trim().length > 0;
  const phoneOk = digits.length === 10;
  const msgOk = message.trim().length > 0;

  const canSubmit = nameOk && emailOk && phoneOk && msgOk && !sending;

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSending(true);
      // TODO: send to backend
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert("Спасибо!", "Ваше сообщение отправлено.");
      setMessage("");
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>
          Уважаемые клиенты, мы всегда рады выслушать ваши предложения и отзывы.
          Заранее благодарим!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ваше ФИО*"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email*"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <MaskInput
          style={styles.input}
          placeholder="+7 (___)-__-__*"
          value={maskedPhone}
          onChangeText={(masked, unmasked) => {
            const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
            setDigits(next);
            setMaskedPhone(masked);
          }}
          keyboardType="number-pad"
          inputMode="numeric"
          mask={[
            "+",
            "7",
            " ",
            "(",
            /\d/,
            /\d/,
            /\d/,
            ")",
            "-",
            /\d/,
            /\d/,
            "-",
            /\d/,
            /\d/,
          ]}
          maxLength={18}
        />

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Ваш отзыв или пожелания"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom fixed button */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
            disabled={!canSubmit}
            onPress={onSubmit}
          >
            <Text style={styles.submitText}>
              {sending ? "Отправляем..." : "Отправить"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  subtext: "#6B7280",
  inputBg: "#F7F7F9",
  border: "#ECECEC",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 8 },

  lead: {
    fontSize: 14,
    lineHeight: 26,
    color: COLORS.subtext,
    marginBottom: 12,
    marginTop: 8,
    fontWeight: "400",
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: COLORS.text,
    marginTop: 12,
    fontWeight: "400",
  },
  textarea: { height: 160 },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  submit: {
    backgroundColor: COLORS.orange,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
