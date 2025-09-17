import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRegisterMutation } from "../../../services/yesExchange";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// ---- Schema ----
const schema = z.object({
  firstName: z.string().trim().min(1, "Укажите имя"),
  lastName: z.string().trim().optional(),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
  // residentRK теперь не обязателен, может быть true или false
  residentRK: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();

  const [doRegister, { isLoading }] = useRegisterMutation();

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      digits: "",
      residentRK: false,
    },
  });

  const digits = watch("digits");

  // Prefill if phone passed as +7XXXXXXXXXX
  useEffect(() => {
    const p = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone;
    if (p && p.startsWith("+7") && p.length === 12) {
      setValue("digits", p.slice(2), { shouldValidate: true });
    }
  }, [rawPhone, setValue]);

  // ---- Phone mask helpers
  const formatKZ = (d: string) => {
    const p = d.padEnd(10, "_").slice(0, 10);
    const a = p.slice(0, 3);
    const b = p.slice(3, 6);
    const c = p.slice(6, 8);
    const e = p.slice(8, 10);
    return `+7 (${a}) ${b}-${c}-${e}`.replace(/_/g, "_");
  };

  const onPhoneChange = (text: string) => {
    let only = (text.match(/\d/g) || []).join("");
    if (only.startsWith("7") || only.startsWith("8")) only = only.slice(1);
    if (only.startsWith("77")) only = only.slice(2);
    setValue("digits", only.slice(0, 10), { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    const e164 = `+7${values.digits}`;
    try {
      await doRegister({
        phone: e164,
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        residentRK: values.residentRK,
      }).unwrap();

      // ✅ уведомляем пользователя
      Alert.alert(
        "Регистрация успешна",
        "Вы успешно зарегистрировались! Теперь войдите в свой аккаунт.",
        [
          {
            text: "Ок",
            onPress: () => router.back(), // вернуться на экран логина
          },
        ]
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        "Не удалось зарегистрироваться. Попробуйте ещё раз.";
      alert(msg);
    }
  };

  const disabled = !isValid || isLoading || isSubmitting;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require("../../../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Добро пожаловать{"\n"}в Yes Exchange!</Text>
      <Text style={styles.subtitle}>
        Создайте свой аккаунт и получите{" "}
        <Text style={styles.discount}>скидку 5%</Text>
      </Text>

      {/* First Name */}
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Ваше имя*"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
            {errors.firstName && (
              <Text style={styles.error}>{errors.firstName.message}</Text>
            )}
          </>
        )}
      />

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            placeholder="Ваша фамилия"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
        )}
      />

      {/* Phone */}
      <Controller
        control={control}
        name="digits"
        render={() => (
          <>
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="+7 (___) ___-__-__ *"
              value={formatKZ(digits)}
              onChangeText={onPhoneChange}
              keyboardType="phone-pad"
              inputMode="numeric"
              textContentType="telephoneNumber"
              autoComplete="tel"
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={19}
            />
            {errors.digits && (
              <Text style={styles.error}>{errors.digits.message}</Text>
            )}
          </>
        )}
      />

      {/* Resident RK (checkbox) */}
      <Controller
        control={control}
        name="residentRK"
        render={({ field: { value, onChange } }) => (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => onChange(!value)}
          >
            <View
              style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}
            >
              {value && <View style={styles.checkboxDot} />}
            </View>
            <Text style={styles.checkboxLabel}>Я являюсь резидентом РК</Text>
          </Pressable>
        )}
      />

      <TouchableOpacity
        style={[styles.cta, disabled && styles.ctaDisabled]}
        disabled={disabled}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.ctaText}>
          {isLoading || isSubmitting ? "Отправка..." : "Зарегистрироваться"}
        </Text>
      </TouchableOpacity>

      <Pressable style={{ marginTop: 18 }} onPress={() => router.back()}>
        <Text style={styles.loginText}>Войти</Text>
      </Pressable>
    </ScrollView>
  );
}

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  subtext: "#6B7280",
  inputBorder: "#E5E7EB",
  inputBg: "#FFFFFF",
  error: "#DC2626",
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    paddingTop: 100,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  logo: {
    width: 122,
    height: 80,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.subtext,
    textAlign: "center",
    marginBottom: 12,
  },
  discount: { color: COLORS.orange, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 12,
  },
  error: {
    color: COLORS.error,
    marginTop: 6,
    fontSize: 13,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxBoxChecked: { borderColor: COLORS.orange },
  checkboxDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: COLORS.orange,
  },
  checkboxLabel: { fontSize: 16, color: COLORS.text },
  cta: {
    backgroundColor: COLORS.orange,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  loginText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
});
