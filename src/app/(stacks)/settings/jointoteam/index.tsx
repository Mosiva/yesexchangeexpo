import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";
import { useSubmitJobApplicationMutation } from "../../../../services/yesExchange";

// --- Validation schema ---
const schema = z.object({
  fullName: z.string().trim().min(1, "Введите ваше ФИО"),
  email: z
    .string()
    .trim()
    .email("Введите корректный Email")
    .min(1, "Укажите Email"),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
  coverLetter: z.string().trim().min(1, "Введите сопроводительное письмо"),
});

type FormValues = z.infer<typeof schema>;

export default function JoinToTeamScreen() {
  const [submitJobApplication, { isLoading }] =
    useSubmitJobApplicationMutation();
  const insets = useSafeAreaInsets();
  const ATTACH_DISABLED = true;

  // refs
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // phone states
  const [maskedPhone, setMaskedPhone] = useState("+7");
  const [digits, setDigits] = useState("");

  // допустимые коды операторов РК
  const validPrefixes = [
    "700",
    "701",
    "702",
    "703",
    "704",
    "705",
    "706",
    "707",
    "708",
    "709",
    "747",
    "771",
    "775",
    "776",
    "777",
    "778",
  ];
  const prefix = digits.slice(0, 3);
  const isPrefixValid =
    digits.length >= 3 ? validPrefixes.includes(prefix) : true;

  // файл (UI only)
  const [resume, setResume] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      digits: "",
      coverLetter: "",
    },
  });

  // --- Pick resume ---
  const pickResume = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (res.assets?.[0]) setResume(res.assets[0]);
    else Alert.alert("Ошибка", "Не удалось выбрать файл.");
  };

  // --- Submit ---
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting || isLoading) return;

    const e164 = `+7${values.digits}`;
    try {
      const res = await submitJobApplication({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: e164,
        coverLetter: values.coverLetter.trim(),
      }).unwrap();

      Alert.alert(
        "Отправлено",
        res?.message || "Мы свяжемся с вами в ближайшее время."
      );

      router.push({ pathname: "/(tabs)/(main)" });
    } catch (err: any) {
      console.error("❌ Ошибка при отправке заявки:", err);
      const message =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        "Не удалось отправить заявку. Попробуйте позже.";
      Alert.alert("Ошибка", String(message));
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
        <Text style={styles.subtitle}>
          Заполните форму, чтобы оставить свой отклик
        </Text>

        {/* ФИО */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Ваше ФИО*"
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              {errors.fullName && (
                <Text style={styles.error}>{errors.fullName.message}</Text>
              )}
            </>
          )}
        />

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email*"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
              {errors.email && (
                <Text style={styles.error}>{errors.email.message}</Text>
              )}
            </>
          )}
        />

        {/* Phone */}
        <Controller
          control={control}
          name="digits"
          render={({ field: { onChange } }) => (
            <>
              <MaskInput
                ref={phoneRef}
                style={styles.input}
                placeholder="+7 (___) ___-__-__*"
                keyboardType="number-pad"
                inputMode="numeric"
                autoCorrect={false}
                autoCapitalize="none"
                mask={[
                  "+",
                  "7",
                  " ",
                  "(",
                  /\d/,
                  /\d/,
                  /\d/,
                  ")",
                  " ",
                  /\d/,
                  /\d/,
                  /\d/,
                  "-",
                  /\d/,
                  /\d/,
                  "-",
                  /\d/,
                  /\d/,
                ]}
                value={maskedPhone}
                onChangeText={(masked, unmasked) => {
                  const digitsOnly = (unmasked || "")
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  onChange(digitsOnly);
                  setDigits(digitsOnly);
                  setMaskedPhone(masked);
                }}
                maxLength={19}
              />
              {errors.digits && (
                <Text style={styles.error}>{errors.digits.message}</Text>
              )}
              {digits.length >= 3 && !isPrefixValid && (
                <Text style={styles.error}>
                  Доступны только коды операторов Казахстана
                </Text>
              )}
            </>
          )}
        />

        {/* Resume */}
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

        {/* About */}
        <Controller
          control={control}
          name="coverLetter"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Расскажите немного о себе*"
                value={value}
                onChangeText={onChange}
                multiline
                textAlignVertical="top"
              />
              {errors.coverLetter && (
                <Text style={styles.error}>{errors.coverLetter.message}</Text>
              )}
            </>
          )}
        />
      </ScrollView>

      {/* Bottom button */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[
              styles.submit,
              (!isValid || isSubmitting || isLoading) && styles.submitDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting || isLoading}
          >
            <Text style={styles.submitText}>
              {isSubmitting || isLoading ? "Отправляем..." : "Отправить"}
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
  error: "#DC2626",
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 8 },

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
  error: {
    color: COLORS.error,
    marginTop: 4,
    fontSize: 13,
  },
  disabled: { opacity: 0.5 },
});
