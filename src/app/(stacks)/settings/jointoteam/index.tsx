// screens/JoinToTeamScreen.tsx

import { zodResolver } from "@hookform/resolvers/zod";

import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import UploadResume from "../../../../components/UploadFile";
import { useTheme } from "../../../../hooks/useTheme";
import { useSubmitJobApplicationMutation } from "../../../../services/yesExchange";

const schema = z.object({
  fullName: z.string().trim().min(1, "Введите ваше ФИО"),
  email: z.string().trim().email("Введите корректный Email"),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
  coverLetter: z.string().trim().min(1, "Введите сопроводительное письмо"),
});

type FormValues = z.infer<typeof schema>;

export default function JoinToTeamScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();

  const [resume, setResume] = useState<any | null>(null);

  const [submitJobApplication, { isLoading }] =
    useSubmitJobApplicationMutation();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const [maskedPhone, setMaskedPhone] = useState("+7");
  const [digits, setDigits] = useState("");

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
  });

  const onSubmit = async (values: FormValues) => {
    if (isLoading || isSubmitting) return;

    try {
      const form = new FormData();
      form.append("fullName", values.fullName.trim());
      form.append("email", values.email.trim());
      form.append("phone", `+7${values.digits}`);
      form.append("coverLetter", values.coverLetter.trim());

      if (resume) {
        form.append("resume", {
          uri: resume.uri,
          name: resume.name,
          type: resume.type,
        } as any);
      }
      console.log("form", JSON.stringify(form));

      const response = await submitJobApplication(form).unwrap();
      console.log("✅ SERVER RESPONSE:", response);
      console.log("form", JSON.stringify(form));
      router.push({
        pathname: "/(stacks)/settings/successform",
        params: { isJointTeam: "true" },
      });
    } catch (err: any) {
      console.log("❌ ERROR SUBMITTING FORM:", err);

      const serverMessage =
        err?.data?.message ??
        err?.error ??
        err?.data?.error ??
        "Не удалось отправить заявку";

      Alert.alert(
        "Ошибка",
        Array.isArray(serverMessage) ? serverMessage.join("\n") : serverMessage
      );
    }
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* === введение === */}
        <Text style={s.subtitle}>
          {t("jointoteam.subtitle", "Заполните форму")}
        </Text>

        {/* ФИО */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={s.input}
                placeholder={t("jointoteam.fullName", "Ваше ФИО*")}
                placeholderTextColor={colors.subtext}
                value={value}
                onChangeText={onChange}
              />
              {errors.fullName && (
                <Text style={s.error}>{errors.fullName.message}</Text>
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
                style={s.input}
                ref={emailRef}
                placeholder="Email*"
                placeholderTextColor={colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
              {errors.email && (
                <Text style={s.error}>{errors.email.message}</Text>
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
                style={s.input}
                placeholder="+7 (___) ___-__-__*"
                placeholderTextColor={colors.subtext}
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
                <Text style={s.error}>{errors.digits.message}</Text>
              )}
              {digits.length >= 3 && !isPrefixValid && (
                <Text style={s.error}>
                  {t(
                    "jointoteam.onlyKazakhstanOperators",
                    "Доступны только коды операторов Казахстана"
                  )}
                </Text>
              )}
            </>
          )}
        />

        {/* Резюме */}
        <UploadResume value={resume} onChange={setResume} />

        {/* Письмо */}
        <Controller
          control={control}
          name="coverLetter"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={[s.input, s.textarea]}
                multiline
                placeholder={t("jointoteam.coverLetter", "О себе*")}
                placeholderTextColor={colors.subtext}
                value={value}
                onChangeText={onChange}
              />
              {errors.coverLetter && (
                <Text style={s.error}>{errors.coverLetter.message}</Text>
              )}
            </>
          )}
        />
      </ScrollView>

      {/* кнопка снизу */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[
            s.submit,
            (!isValid || isSubmitting || isLoading) && s.submitDisabled,
          ]}
          // onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting || isLoading}
        >
          <Text style={s.submitText}>
            {isLoading ? "Отправляем..." : "Отправить"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1, paddingHorizontal: 16 },
    subtitle: {
      color: colors.subtext,
      marginTop: 8,
      marginBottom: 12,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.subtext + "33",
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      color: colors.text,
      marginTop: 12,
    },
    textarea: {
      height: 140,
      textAlignVertical: "top",
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    submit: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
    },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    error: { color: "#DC2626", marginTop: 4 },
  });
