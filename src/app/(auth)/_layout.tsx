import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

function CustomHeader({
  title,
  showBackButton = true,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <View style={s.topBar}>
      {showBackButton && (
        <Pressable onPress={() => router.replace("/(tabs)/profile")}>
          <Ionicons name="arrow-back" size={30} color={colors.text} />
        </Pressable>
      )}
      <Text style={s.title}>{title}</Text>
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="choose-language/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sendcode/index"
        options={{
          header: () => <CustomHeader title={t("sendcode.title")} />,
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          header: () => <CustomHeader title={t("register.title")} />,
        }}
      />
    </Stack>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    login: {
      fontSize: 16,
      color: "#4F7942",
    },
  });
