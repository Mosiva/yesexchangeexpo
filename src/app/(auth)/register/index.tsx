import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { phone: rawPhone } = useLocalSearchParams<{
    phone?: string | string[];
  }>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [digits, setDigits] = useState(""); // national 10 digits after +7
  const [isResident, setIsResident] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // Prefill if phone passed as +7XXXXXXXXXX
  useEffect(() => {
    const p = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone;
    if (p && p.startsWith("+7") && p.length === 12) setDigits(p.slice(2));
  }, [rawPhone]);

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
    setDigits(only.slice(0, 10));
  };

  const isPhoneValid = digits.length === 10;
  const e164 = `+7${digits}`;
  const canSubmit = firstName.trim().length > 0 && isPhoneValid && isResident;

  const handleRegister = async () => {
    if (!canSubmit) return;
    // TODO: call your register API; for OTP flow push to code screen:
    router.push({
      pathname: "/(auth)/sendcode",
      params: {
        phone: e164,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        resident: String(isResident),
      },
    });
  };

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

      <TextInput
        style={styles.input}
        placeholder="Ваше имя*"
        value={firstName}
        onChangeText={setFirstName}
        returnKeyType="next"
        onSubmitEditing={() => lastNameRef.current?.focus()}
      />

      <TextInput
        ref={lastNameRef}
        style={styles.input}
        placeholder="Ваша фамилия"
        value={lastName}
        onChangeText={setLastName}
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
      />

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

      {/* RK Resident checkbox */}
      <Pressable
        style={styles.checkboxRow}
        onPress={() => setIsResident((v) => !v)}
      >
        <View
          style={[styles.checkboxBox, isResident && styles.checkboxBoxChecked]}
        >
          {isResident && <View style={styles.checkboxDot} />}
        </View>
        <Text style={styles.checkboxLabel}>Я являюсь резидентом РК</Text>
      </Pressable>

      <TouchableOpacity
        style={[styles.cta, !canSubmit && styles.ctaDisabled]}
        disabled={!canSubmit}
        onPress={handleRegister}
      >
        <Text style={styles.ctaText}>Зарегистрироваться</Text>
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
