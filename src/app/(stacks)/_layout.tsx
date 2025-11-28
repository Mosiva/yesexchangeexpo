import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

import { useTranslation } from "react-i18next";

function CustomHeader({
  title,
  showBackButton = false,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const canGoBack =
    typeof router.canGoBack === "function" ? router.canGoBack() : false;

  return (
    <View style={styles.topBar}>
      {showBackButton && canGoBack ? (
        <Pressable onPress={() => router.back()} hitSlop={12}>
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
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="norates"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="archives/index"
        options={{
          header: () => (
            <CustomHeader
              title={t("archives.title", "Архив")}
              showBackButton={true}
            />
          ),
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="archives/[id]"
        options={{
          header: () => (
            <CustomHeader
              title={t("archives.title", "Архив")}
              showBackButton={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="news/index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => <CustomHeader title="Новости" showBackButton={true} />,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="news/[id]"
        options={{
        // Hide back by default + disable iOS swipe-back
        header: () => <CustomHeader title="" showBackButton={true} />,
        gestureEnabled: true,
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
      flexShrink: 1,
      color: colors.text,
    },
  });
