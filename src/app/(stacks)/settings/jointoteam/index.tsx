import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function JoinToTeamScreen() {
  const insets = useSafeAreaInsets();

  // --- hard disable flags ---
  const ATTACH_DISABLED = true;
  const SUBMIT_DISABLED = true;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [about, setAbout] = useState("");
  const [resume, setResume] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [sending, setSending] = useState(false);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const phoneOk = digits.length === 10;
  const nameOk = fullName.trim().length > 0;

  // Even if form is valid, SUBMIT_DISABLED keeps it disabled.
  const canSubmit =
    nameOk && emailOk && phoneOk && !sending && !SUBMIT_DISABLED;

  const pickResume = async () => {
    if (ATTACH_DISABLED) return; // guard
    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (res.type === "success") setResume(res.assets?.[0] ?? null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setSending(true);
      await new Promise((r) => setTimeout(r, 800));
      Alert.alert("Отправлено", "Мы свяжемся с вами в ближайшее время.");
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message ?? "Не удалось отправить");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Заполните форму, чтобы оставить свой отклик
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
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <MaskInput
          style={styles.input}
          placeholder="+7 (___)-__-__*"
          keyboardType="number-pad"
          inputMode="numeric"
          value={maskedPhone}
          onChangeText={(masked, unmasked) => {
            const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
            setDigits(next);
            setMaskedPhone(masked);
          }}
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

        <TouchableOpacity
          style={[styles.attach, ATTACH_DISABLED && styles.disabled]}
          onPress={pickResume}
          disabled={ATTACH_DISABLED}
        >
          <Ionicons name="attach-outline" size={22} color="#111827" />
          <Text style={styles.attachText}>
            {resume?.name ? `Файл: ${resume.name}` : "Прикрепить резюме"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Расскажите немного о себе"
          value={about}
          onChangeText={setAbout}
          multiline
          textAlignVertical="top"
          numberOfLines={5}
        />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[
              styles.submit,
              (!canSubmit || SUBMIT_DISABLED) && styles.submitDisabled,
            ]}
            onPress={submit}
            disabled={!canSubmit || SUBMIT_DISABLED}
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

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 8,
    marginBottom: 12,
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
  textarea: { height: 140 },

  attach: {
    marginTop: 12,
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  attachText: { fontSize: 16, color: COLORS.text, fontWeight: "600" },

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

  disabled: { opacity: 0.5 },
});
