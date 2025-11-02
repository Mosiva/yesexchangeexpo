import { zodResolver } from "@hookform/resolvers/zod";
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
import { useSubmitFeedbackMutation } from "../../../../services/yesExchange";

// --- Validation schema ---
const schema = z.object({
  fullName: z.string().trim().min(1, "Введите ваше ФИО"),
  email: z
    .string()
    .trim()
    .email("Введите корректный Email")
    .min(1, "Укажите Email"),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
  message: z.string().trim().min(1, "Введите текст сообщения"),
});

type FormValues = z.infer<typeof schema>;

export default function FeedbacksScreen() {
  const insets = useSafeAreaInsets();
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

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
      message: "",
    },
  });

  // --- Submit ---
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting || isLoading) return;
    const e164 = `+7${values.digits}`;

    try {
      const res = await submitFeedback({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: e164,
        message: values.message.trim(),
      }).unwrap();

      console.log("✅ Ответ сервера:", res);
      Alert.alert(
        "Спасибо!",
        res?.message || "Ваше сообщение успешно отправлено."
      );

      router.push({ pathname: "/(tabs)/(main)" });
    } catch (err: any) {
      console.error("❌ Ошибка при отправке:", err);
      const msg =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        "Не удалось отправить сообщение. Попробуйте позже.";
      Alert.alert("Ошибка", String(msg));
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

        {/* Message */}
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Ваш отзыв или пожелания*"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {errors.message && (
                <Text style={styles.error}>{errors.message.message}</Text>
              )}
            </>
          )}
        />
      </ScrollView>

      {/* Bottom fixed button */}
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
            disabled={!isValid || isSubmitting || isLoading}
            onPress={handleSubmit(onSubmit)}
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

  lead: {
    fontSize: 14,
    lineHeight: 24,
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
  error: {
    color: COLORS.error,
    marginTop: 4,
    fontSize: 13,
  },
});
