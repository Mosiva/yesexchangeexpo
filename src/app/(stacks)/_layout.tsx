import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function CustomHeader({
  title,
  showBackButton = false,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();
  const canGoBack =
    typeof router.canGoBack === "function" ? router.canGoBack() : false;

  return (
    <View style={styles.topBar}>
      {showBackButton && canGoBack ? (
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </Pressable>
      ) : (
        <View style={{ width: 28 }} />
      )}

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <Stack>
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
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
  },
});
