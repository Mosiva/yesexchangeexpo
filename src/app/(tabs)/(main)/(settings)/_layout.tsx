import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

function CustomHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="chevron-back-circle-outline" size={30} color="black" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  const { t, i18n } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <CustomHeader title={t("mainpass.settings")} />,
        }}
      />
      <Stack.Screen
        name="editUserCabinet/index"
        options={{
          header: () => <CustomHeader title={t("mainpass.setmyaccount")} />,
        }}
      />
      <Stack.Screen
        name="userhistory/index"
        options={{
          header: () => <CustomHeader title={t("mainpass.accounthistory")} />,
        }}
      />
      <Stack.Screen
        name="languageswitcher/index"
        options={{
          header: () => <CustomHeader title={t("mainpass.changelanguage")} />,
        }}
      />
      <Stack.Screen
        name="contactus/index"
        options={{
          header: () => <CustomHeader title={t("mainpass.contactinfo")} />,
        }}
      />
      <Stack.Screen
        name="rules/index"
        options={{
          header: () => <CustomHeader title="FAQ" />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  login: {
    fontSize: 16,
    color: "#4F7942",
  },
});
