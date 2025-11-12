import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../../../services/yesExchange";

const RESEND_DELAY = 60;
const BOX = 52;

export default function SendCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const s = makeStyles(colors);
  const isLight = theme === "light";

  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();
  const phone = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const code = digits.join("");
  const isComplete = code.length === 6;

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const { finalizeLogin } = useAuth();

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
    if (!isComplete || isVerifying) return;
    try {
      const resp = await verifyOtp({ phone, code }).unwrap();
      const payload: any = resp ?? {};
      const access =
        payload.accessToken ??
        payload.access ??
        payload.access_token ??
        payload.token ??
        null;
      const refresh =
        payload.refreshToken ??
        payload.refresh ??
        payload.refresh_token ??
        null;
      const user = payload.user ?? null;
      if (access) await finalizeLogin({ access, refresh, user });
      router.replace("/(tabs)/(main)");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        t("sendcode.wrongCode", "Неверный код, попробуйте ещё раз");
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      Alert.alert(t("common.error"), String(msg));
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    try {
      await resendOtp({ phone }).unwrap();
      setSecondsLeft(RESEND_DELAY);
      Alert.alert(
        t("common.success"),
        t("sendcode.codeSentAgain", "Код отправлен повторно")
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        t(
          "sendcode.errorSendingCode",
          "Не удалось отправить код. Попробуйте позже."
        );
      Alert.alert(t("common.error"), String(msg));
    }
  };

  const formatPhone = (p: string) =>
    p.startsWith("+7") && p.length === 12
      ? `+7 (${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8, 10)}-${p.slice(
          10,
          12
        )}`
      : p;

  const confirmDisabled = !isComplete || isVerifying;

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      <Text style={s.helperText}>
        {t("sendcode.codeSentTo", "Код отправлен на")}{" "}
        <Text style={s.helperEmail}>{formatPhone(phone)}</Text>
      </Text>

      <View style={s.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el: any) => (inputsRef.current[i] = el)}
            style={s.otpBox}
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
            placeholderTextColor={colors.subtext}
            editable={!isVerifying && !isResending}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[s.button, confirmDisabled && s.buttonDisabled]}
        disabled={confirmDisabled}
        onPress={handleContinue}
      >
        <Text style={[s.buttonText, confirmDisabled && s.buttonTextDisabled]}>
          {isVerifying
            ? t("sendcode.checking", "Проверяем...")
            : t("sendcode.confirmCode", "Подтвердить код")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResend}
        disabled={secondsLeft > 0 || isResending}
        style={{ marginTop: 12 }}
      >
        {secondsLeft > 0 ? (
          <Text style={s.resendText}>
            {t("sendcode.sendCodeAgainIn", "Отправить код через")}{" "}
            {`00:${String(secondsLeft).padStart(2, "0")}`}
          </Text>
        ) : (
          <Text style={[s.resendText, s.resendActive]}>
            {isResending
              ? t("sendcode.sendingCode", "Отправляем...")
              : t("sendcode.sendCode", "Отправить код")}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
    helperText: {
      fontSize: 16,
      color: colors.subtext,
      textAlign: "center",
      marginBottom: 20,
    },
    helperEmail: { color: colors.text, fontWeight: "700" },
    otpRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    otpBox: {
      width: BOX,
      height: BOX,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      fontSize: 20,
      color: colors.text,
      backgroundColor: colors.card,
    },
    button: {
      height: 56,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    buttonDisabled: { backgroundColor: colors.subtext + "33" },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    buttonTextDisabled: { color: colors.subtext },
    resendText: {
      textAlign: "center",
      color: colors.subtext,
      fontSize: 16,
      fontWeight: "600",
    },
    resendActive: { color: colors.primary },
  });
