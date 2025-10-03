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
        <Pressable onPress={() => router.replace("/(tabs)/profile")}>
          <Ionicons name="arrow-back" size={30} color="black" />
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
          header: () => <CustomHeader title="Введите код из смс" />,
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          header: () => <CustomHeader title="Регистрация" />,
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
