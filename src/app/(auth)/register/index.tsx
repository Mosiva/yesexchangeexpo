import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { z } from "zod";
import { useTheme } from "../../../hooks/useTheme";
import { useRegisterMutation } from "../../../services/yesExchange";

// ---- Schema ----
const schema = z.object({
  firstName: z.string().trim().min(1, "Укажите имя"),
  lastName: z.string().trim().optional(),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
  residentRK: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const s = makeStyles(colors);

  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const [doRegister, { isLoading }] = useRegisterMutation();

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const [maskedPhone, setMaskedPhone] = useState("+7");
  const [showResidentError, setShowResidentError] = useState(false);
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
    setValue,
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

  useEffect(() => {
    const p = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone;
    if (p && p.startsWith("+7") && p.length === 12) {
      const d = p.slice(2);
      setValue("digits", d, { shouldValidate: true });
      setMaskedPhone(
        `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(
          8,
          10
        )}`
      );
    }
  }, [rawPhone, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (!values.residentRK) {
      setShowResidentError(true);
      return;
    }
    setShowResidentError(false);

    const e164 = `+7${values.digits}`;
    try {
      await doRegister({
        phone: e164,
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        residentRK: values.residentRK,
      }).unwrap();

      router.push({ pathname: "/(auth)/sendcode", params: { phone: e164 } });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        t("register.errorInRegister");
      Alert.alert(t("common.error"), String(msg));
    }
  };

  const disabled = !isValid || isLoading || isSubmitting;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      <View style={s.viewcontainer}>
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../../../assets/images/icon.png")}
            style={s.logo}
            resizeMode="contain"
          />

          <Text style={s.title}>{t("register.welcome", "Добро пожаловать")}{"\n"}{t("register.welcomeMessage", "в Yes Exchange!")}</Text>
          <Text style={s.subtitle}>
            {t("register.createAccount", "Создайте свой аккаунт и получите")}{" "}
            <Text style={s.discount}>{t("register.discount", "скидку 5%")}</Text>
          </Text>

          {/* Имя */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  style={s.input}
                  placeholder={t("register.yourName", "Ваше имя")}
                  placeholderTextColor={colors.subtext}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
                {errors.firstName && (
                  <Text style={s.error}>{errors.firstName.message}</Text>
                )}
              </>
            )}
          />

          {/* Фамилия */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={lastNameRef}
                style={s.input}
                placeholder={t("register.yourLastName", "Ваша фамилия")}
                placeholderTextColor={colors.subtext}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            )}
          />

          {/* Телефон */}
          <Controller
            control={control}
            name="digits"
            render={({ field: { onChange } }) => (
              <>
                <MaskInput
                  ref={phoneRef}
                  style={s.input}
                  placeholder="+7 (___) ___-__-__ *"
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
                    {t("register.onlyKazakhstanOperators", "Доступны только коды операторов Казахстана")}
                  </Text>
                )}
              </>
            )}
          />

          {/* Резидент */}
          <Controller
            control={control}
            name="residentRK"
            render={({ field: { value, onChange } }) => (
              <>
                <Pressable
                  style={s.checkboxRow}
                  onPress={() => {
                    setShowResidentError(false);
                    onChange(!value);
                  }}
                >
                  <View style={[s.checkboxBox, value && s.checkboxBoxChecked]}>
                    {value && <View style={s.checkboxDot} />}
                  </View>
                  <Text style={s.checkboxLabel}>{t("register.iAmResidentOfRK", "Я являюсь резидентом РК")}</Text>
                </Pressable>

                {showResidentError && !value && (
                  <Text style={s.error}>
                    {t("register.registrationOnlyForResidentsOfRK", "Регистрация доступна только для граждан РК")}
                  </Text>
                )}
              </>
            )}
          />

          <TouchableOpacity
            style={[s.cta, disabled && s.ctaDisabled]}
            disabled={disabled}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={s.ctaText}>
              {isLoading || isSubmitting ? t("register.sending", "Отправка...") : t("register.register", "Зарегистрироваться")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    viewcontainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 25,
      paddingTop: 10,
      backgroundColor: colors.background,
      flexGrow: 1,
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
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 10,
      fontSize: 16,
      lineHeight: 22,
      color: colors.subtext,
      textAlign: "center",
      marginBottom: 12,
    },
    discount: { color: colors.primary, fontWeight: "800" },
    input: {
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
      marginTop: 12,
    },
    error: {
      color: "#DC2626",
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
      borderColor: colors.subtext,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    checkboxBoxChecked: { borderColor: colors.primary },
    checkboxDot: {
      width: 12,
      height: 12,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    checkboxLabel: { fontSize: 16, color: colors.text },
    cta: {
      backgroundColor: colors.primary,
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
      color: colors.text,
      textAlign: "center",
    },
  });
