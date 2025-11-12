import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

function CustomHeader({
  title,
  showBackButton = false,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const canGoBack =
    typeof router.canGoBack === "function" ? router.canGoBack() : false;

  const s = makeStyles(colors);

  return (
    <View style={s.topBar}>
      {showBackButton && canGoBack ? (
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </Pressable>
      ) : (
        <View style={{ width: 28 }} />
      )}

      <Text style={s.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title={t("profile.title", "Профиль")}
              showBackButton={false}
            />
          ),
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="editprofile/index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title={t("profile.editProfile", "Редактирование личных данных")}
              showBackButton={true}
            />
          ),
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="reservehistory/index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title={t("profile.reserveHistory", "История брони")}
              showBackButton={true}
            />
          ),
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.text,
      flexShrink: 1,
    },
  });
