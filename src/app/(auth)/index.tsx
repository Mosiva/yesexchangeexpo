import { Loader } from "components";
import { useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { useLoginMutation } from "../../services/yesExchange";

export default function LoginScreen() {
  // только национальная часть: 10 цифр
  const [digits, setDigits] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("+7"); // сразу +7
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { error, isAuthenticated, isGuest } = useAuth();
  const { t } = useTranslation();

  // RTK mutation
  const [doLogin] = useLoginMutation();

  // Допустимые коды операторов Казахстана
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
  const isValid = digits.length === 10 && validPrefixes.includes(prefix);
  const e164 = `+7${digits}`;

  // Навигация только после реальной аутентификации (не гостевой)
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      router.replace("/(tabs)/(main)");
    }
  }, [isAuthenticated, isGuest, router]);

  const handleLogin = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      await doLogin({ phone: e164 }).unwrap();

      // 200 OK → бэк выслал OTP → переходим на ввод кода
      router.push({ pathname: "/(auth)/sendcode", params: { phone: e164 } });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.msg ||
        err?.error ||
        t("common.errorInLgoin");
      Alert.alert("Ошибка", String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  // старые ошибки из провайдера, если где-то ещё всплывут
  useEffect(() => {
    if (error?.text) {
      let errorMessage = "";
      try {
        errorMessage = JSON.parse(error.text)?.data?.msg;
      } catch {
        errorMessage = t("common.errorInLgoin");
      }
      Alert.alert("", errorMessage);
    }
  }, [error]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require("../../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Добро пожаловать в Yes Exchange!</Text>
      <Text style={styles.subtitle}>
        Войдите в свой аккаунт по номеру телефона
      </Text>

      <MaskInput
        style={styles.input}
        placeholder="+7 (___) ___-__-__"
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
          const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
          setDigits(next);
          setMaskedPhone(masked);
        }}
        maxLength={19}
      />

      {/* Ошибка при неверном коде */}
      {digits.length >= 3 && !validPrefixes.includes(prefix) && (
        <Text style={styles.error}>
          Доступны только коды операторов Казахстана
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.loginButton,
          (!isValid || isLoading) && styles.loginButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={!isValid || isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? "Отправляем код..." : "Войти"}
        </Text>
      </TouchableOpacity>

      <Pressable
        onPress={() => router.push("/(auth)/register")}
        style={{ marginTop: 24 }}
      >
        <Text style={styles.registerText}>Зарегистрироваться</Text>
      </Pressable>

      {isLoading && <Loader />}
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
    marginBottom: 30,
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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    color: COLORS.error,
    marginTop: 6,
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
  },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  registerText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
});
