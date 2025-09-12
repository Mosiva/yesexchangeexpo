import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function CustomHeader({
  title,
  showBackButton = true,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      {showBackButton && (
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back-circle-outline"
            size={30}
            color="black"
          />
        </Pressable>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <CustomHeader title="Авторизация" showBackButton={false} />
          ),
        }}
      />
      <Stack.Screen
        name="resetpassword/index"
        options={{
          header: () => <CustomHeader title="Забыли пароль" />,
        }}
      />
      <Stack.Screen
        name="onboarding/index"
        options={{
          header: () => <CustomHeader title="Онбоурдинг" />,
        }}
      />
      <Stack.Screen
        name="choose-language/index"
        options={{
          header: () => (
            <CustomHeader title="Выбор языка" showBackButton={false} />
          ),
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
