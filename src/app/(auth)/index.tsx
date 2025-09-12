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
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen() {
  const [digits, setDigits] = useState(""); // only national part: 10 digits
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, error, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) router.replace("/(tabs)/(main)");
  }, [isAuthenticated]);

  // format +7 (###) ###-##-##
  const formatKZ = (d: string) => {
    const p = d.padEnd(10, "_").slice(0, 10);
    const a = p.slice(0, 3);
    const b = p.slice(3, 6);
    const c = p.slice(6, 8);
    const e = p.slice(8, 10);
    return `+7 (${a}) ${b}-${c}-${e}`.replace(/_/g, "_");
  };

  const handleChange = (text: string) => {
    let only = (text.match(/\d/g) || []).join(""); // keep digits
    // allow users to type 7/8/+7 upfront; keep only national 10 digits
    if (only.startsWith("7") || only.startsWith("8")) only = only.slice(1);
    if (only.startsWith("77")) only = only.slice(2); // rare paste cases
    setDigits(only.slice(0, 10));
  };

  const isValid = digits.length === 10;
  const e164 = `+7${digits}`; // send this to backend

  const handleLogin = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      // If you use OTP: navigate to the code screen
      // router.push({ pathname: "/(auth)/sendcode", params: { phone: e164 } });
      // If you actually log in with phone/password token, use:
      // await login({ login: e164, password: "" });
      router.push({ pathname: "/(auth)/sendcode", params: { phone: e164 } });
    } catch (e) {
      Alert.alert("", t("common.errorInLgoin"));
    } finally {
      setIsLoading(false);
    }
  };

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

      <TextInput
        style={styles.input}
        placeholder="+7 (___) ___-__-__"
        value={formatKZ(digits)}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        inputMode="numeric"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoCorrect={false}
        autoCapitalize="none"
        maxLength={19} // "+7 (###) ###-##-##"
      />

      <TouchableOpacity
        style={[
          styles.loginButton,
          (!isValid || isLoading) && styles.loginButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={!isValid || isLoading}
      >
        <Text style={styles.loginButtonText}>Войти</Text>
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
