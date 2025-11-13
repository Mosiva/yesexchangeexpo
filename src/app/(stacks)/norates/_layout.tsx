import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

function CustomHeader({
  title,
  showBackButton = false,
  onBack,
}: {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const canGoBack =
    typeof router.canGoBack === "function" ? router.canGoBack() : false;

  const handleBack = () => {
    if (onBack) onBack();
    else if (canGoBack) router.back();
  };

  return (
    <View style={styles.topBar}>
      {showBackButton ? (
        <Pressable onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </Pressable>
      ) : (
        <View style={{ width: 28 }} />
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title={t("norates.title", "Бронь без привязки к курсу")}
              showBackButton={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="withrates/index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title={t("norates.withrates.title", "Бронь с привязкой к курсу")}
              showBackButton={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="branchpicker/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="moderation/index"
        options={{
          gestureEnabled: false,
          header: () => (
            <CustomHeader
              title={t("norates.moderation.name", "В обработке")}
              showBackButton={true}
              onBack={() => router.replace("/(tabs)/(main)")}
            />
          ),
        }}
      />
    </Stack>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
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
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
  },
});
