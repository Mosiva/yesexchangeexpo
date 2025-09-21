import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { Loader } from "components";
import { useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { clientApi } from "services";
import { useLoginMutation } from "../../../services/yesExchange";

const { useGetClientQuery } = clientApi;

// +7XXXXXXXXXX → +7 707 777-77-77
function formatPhoneE164ToPretty(p?: string) {
  if (!p) return "";
  const d = p.replace(/\D/g, "");
  const ten = d.startsWith("7") ? d.slice(1) : d;
  if (ten.length !== 10) return p;
  const a = ten.slice(0, 3);
  const b = ten.slice(3, 6);
  const c = ten.slice(6, 8);
  const e = ten.slice(8, 10);
  return `+7 ${a} ${b}-${c}-${e}`;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout, error, isAuthenticated, isGuest } = useAuth();

  const {
    data: rawClient,
    refetch: refetchClient,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useGetClientQuery({});

  // Normalize possible shapes: {data: client} or client
  const client: any = (rawClient as any)?.data ?? rawClient ?? null;

  useFocusEffect(
    useCallback(() => {
      refetchClient();
    }, [refetchClient])
  );

  // ---- Guest login (phone) state ----
  const [digits, setDigits] = useState(""); // 10 digits national
  const [maskedPhone, setMaskedPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doLogin] = useLoginMutation();

  useEffect(() => {
    if (error?.text) {
      let msg = "";
      try {
        msg = JSON.parse(error.text)?.data?.msg;
      } catch {
        msg = t("common.errorInLgoin");
      }
      Alert.alert("", msg);
    }
  }, [error]);

  const isValid = digits.length === 10;
  const e164 = `+7${digits}`;

  const handleSendCode = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      await doLogin({ phone: e164 }).unwrap(); // backend should send OTP
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

  // ========================= RENDER =========================
  const isAuthed = !!client && !isClientError;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {!isAuthed ? (
        // -------------------- GUEST MODE --------------------
        <>
          <Text style={styles.subtitle}>
            Войдите в аккаунт или создайте новый
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

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!isValid || isLoading) && styles.primaryBtnDisabled,
            ]}
            onPress={handleSendCode}
            disabled={!isValid || isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? "Отправляем код..." : "Войти"}
            </Text>
          </TouchableOpacity>

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={{ marginTop: 24 }}
          >
            <Text style={styles.linkText}>Зарегистрироваться</Text>
          </Pressable>

          {(isLoading || isClientLoading) && <Loader />}
        </>
      ) : (
        // -------------------- USER MODE --------------------
        <>
          <View style={styles.nameRow}>
            <Text style={styles.fullName} numberOfLines={1}>
              {[client.firstName, client.lastName].filter(Boolean).join(" ")}
            </Text>
            <Pressable
              hitSlop={10}
              accessibilityLabel="Редактировать профиль"
              onPress={() => router.push("/(tabs)/profile/editprofile")}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="#727376" />
            </Pressable>
          </View>

          <Text style={styles.phoneText}>
            {formatPhoneE164ToPretty(client.phone)}
          </Text>

          <Pressable
            style={styles.cardRow}
            accessibilityLabel="История бронирования"
          >
            <View style={styles.cardLeft}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color="#F58220"
              />
            </View>
            <Text style={styles.cardText}>История бронирования</Text>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={logout}
            style={styles.logoutRow}
            accessibilityLabel="Выйти из профиля"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Выйти из профиля</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bg,
    flexGrow: 1,
  },

  // Titles
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 24,
  },
  fullName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  phoneText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 16,
    fontWeight: "400",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Card row
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  cardLeft: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    fontWeight: "400",
  },

  // Logout
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 28,
    gap: 8,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },

  // Guest form styles
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.subtext,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  linkText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
});
