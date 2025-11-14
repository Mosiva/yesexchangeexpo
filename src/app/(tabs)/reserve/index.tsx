import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { clientApi } from "services";
import LoginDiscountBanner from "../../../components/LoginDiscountBanner";
import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../providers/Auth";

const { useGetClientQuery } = clientApi;

export default function ReserveScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isLight = theme === "light";
  const s = makeStyles(colors);
  const { isGuest } = useAuth();

  const {
    data: rawClient,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useGetClientQuery({});
  const client: any = (rawClient as any)?.data ?? rawClient ?? null;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />

      {/* Top tiles */}
      <View style={s.tilesRow}>
        <Tile
          title={t("reserve.noRate", "Без привязки\nк курсу")}
          sub={t("reserve.noRateSub", "Бронь до 1 часа")}
          Icon={
            <FontAwesome6 name="money-bills" size={24} color={colors.primary} />
          }
          onPress={() => router.push("/(stacks)/norates/branchpicker")}
          colors={colors}
        />
        <Tile
          title={t("reserve.withRate", "С привязкой\nк курсу")}
          sub={t("reserve.withRateSub", "Бронь до 30 минут")}
          Icon={
            <MaterialIcons name="analytics" size={24} color={colors.primary} />
          }
          onPress={() =>
            router.push({
              pathname: "/(stacks)/norates/branchpicker",
              params: { isRateLocked: "true" },
            })
          }
          colors={colors}
        />
      </View>

      {/* Gold reservation */}
      <Pressable style={s.wideCard}>
        <View style={s.rowLeft}>
          <View style={s.iconBadge}>
            <MaterialCommunityIcons
              name="gold"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.wideTitle}>
              {t("reserve.goldReservation", "Бронирование золота")}
            </Text>
            <Text style={s.wideSub}>
              {t("reserve.goldReservationSub", "Золотые слитки НБ РК")}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* History row */}
      {!isGuest ? (
        <Pressable
          style={s.historyRow}
          onPress={() => router.push("/(tabs)/reserve/reservehistoryr")}
        >
          <View style={s.rowLeft}>
            <View style={s.iconBadge}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={s.historyText}>
              {t("profile.reserveHistory", "История бронирования")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </Pressable>
      ) : (
        <LoginDiscountBanner onPress={() => router.push("/(tabs)/profile")} />
      )}
    </ScrollView>
  );
}

/* -------------------- UI bits -------------------- */

function Tile({
  title,
  sub,
  Icon,
  onPress,
  colors,
}: {
  title: string;
  sub?: string;
  Icon: React.ReactNode;
  onPress?: () => void;
  colors: any;
}) {
  return (
    <Pressable style={[tileStyles(colors).tile]} onPress={onPress}>
      <View style={tileStyles(colors).iconBadge}>{Icon}</View>
      <Text style={tileStyles(colors).tileTitle}>{title}</Text>
      {sub ? <Text style={tileStyles(colors).tileSub}>{sub}</Text> : null}
    </Pressable>
  );
}

/* -------------------- styles -------------------- */

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screenTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
      marginTop: 16,
      marginBottom: 12,
    },
    tilesRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    wideCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      paddingHorizontal: 14,
      paddingVertical: 16,
      marginTop: 12,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    wideTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
    wideSub: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 2,
      fontWeight: "400",
    },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      paddingHorizontal: 14,
      paddingVertical: 18,
      marginTop: 14,
    },
    historyText: { fontSize: 14, fontWeight: "600", color: colors.text },
  });

const tileStyles = (colors: any) =>
  StyleSheet.create({
    tile: {
      flex: 1,

      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.subtext + "33",
      padding: 16,
      minHeight: 170,
      justifyContent: "center",
      alignItems: "center",
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    tileTitle: {
      fontSize: 14,
      lineHeight: 26,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    tileSub: {
      marginTop: 10,
      fontSize: 12,
      color: colors.subtext,
      fontWeight: "400",
    },
  });
