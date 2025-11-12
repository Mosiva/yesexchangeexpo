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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { clientApi } from "services";
import { useTheme } from "../../../hooks/useTheme";
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
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const s = makeStyles(colors);
  const { logout, error, isGuest } = useAuth();

  const {
    data: rawClient,
    refetch: refetchClient,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useGetClientQuery({});

  const client: any = (rawClient as any)?.data ?? rawClient ?? null;

  useFocusEffect(
    useCallback(() => {
      refetchClient();
    }, [refetchClient])
  );

  // ---- Guest login (phone) state ----
  const [digits, setDigits] = useState(""); // 10 цифр
  const [maskedPhone, setMaskedPhone] = useState("+7"); // сразу +7
  const [isLoading, setIsLoading] = useState(false);
  const [doLogin] = useLoginMutation();

  // допустимые коды операторов Казахстана
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

  const handleSendCode = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      await doLogin({ phone: e164 }).unwrap(); // backend должен отправить OTP
      router.push({ pathname: "/(auth)/sendcode", params: { phone: e164 } });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.msg ||
        err?.error ||
        t("common.errorInLgoin");
      Alert.alert(t("common.error", "Ошибка"), String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthed = !!client && !isClientError && !isGuest;

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />

      {!isAuthed ? (
        // -------------------- GUEST MODE --------------------
        <>
          <Text style={s.subtitle}>
            {t("profile.subtitle", "Войдите в аккаунт или создайте новый")}
          </Text>

          <MaskInput
            style={s.input}
            placeholder="+7 (___) ___-__-__"
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
              const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
              setDigits(next);
              setMaskedPhone(masked);
            }}
            maxLength={19}
          />

          {digits.length >= 3 && !validPrefixes.includes(prefix) && (
            <Text style={s.error}>
              {t("profile.error", "Доступны только коды операторов Казахстана")}
            </Text>
          )}

          <TouchableOpacity
            style={[
              s.primaryBtn,
              (!isValid || isLoading) && s.primaryBtnDisabled,
            ]}
            onPress={handleSendCode}
            disabled={!isValid || isLoading}
          >
            <Text style={s.primaryBtnText}>
              {isLoading
                ? t("profile.sendingCode", "Отправляем код...")
                : t("profile.login", "Войти")}
            </Text>
          </TouchableOpacity>

          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={{ marginTop: 24 }}
          >
            <Text style={s.linkText}>
              {t("profile.register", "Зарегистрироваться")}
            </Text>
          </Pressable>

          {(isLoading || isClientLoading) && <Loader />}
        </>
      ) : (
        // -------------------- USER MODE --------------------
        <>
          <View style={s.nameRow}>
            <Text style={s.fullName} numberOfLines={1}>
              {[client.firstName, client.lastName].filter(Boolean).join(" ")}
            </Text>
            <Pressable
              hitSlop={10}
              accessibilityLabel={t(
                "profile.editProfile",
                "Редактировать профиль"
              )}
              onPress={() => router.push("/(tabs)/profile/editprofile")}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={colors.subtext}
              />
            </Pressable>
          </View>

          <Text style={s.phoneText}>
            {formatPhoneE164ToPretty(client.phone)}
          </Text>

          <Pressable
            style={s.cardRow}
            accessibilityLabel={t(
              "profile.reserveHistory",
              "История бронирования"
            )}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/profile/reservehistory",
                params: { phone: client.phone },
              })
            }
          >
            <View style={s.cardLeft}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={s.cardText}>
              {t("profile.reserveHistory", "История бронирования")}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.subtext} />
          </Pressable>

          <Pressable
            onPress={logout}
            style={s.logoutRow}
            accessibilityLabel={t("profile.logout", "Выйти из профиля")}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={s.logoutText}>
              {t("profile.logout", "Выйти из профиля")}
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },

    fullName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    phoneText: {
      fontSize: 16,
      color: colors.subtext,
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
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
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
      color: colors.text,
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
      color: colors.subtext,
      textAlign: "center",
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
    },
    error: {
      color: "#DC2626",
      marginTop: 6,
      fontSize: 13,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
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
      color: colors.text,
      textAlign: "center",
    },
  });
