import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function CustomHeader({
  title,
  showBackButton = false,
  onBack,
}: {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}) {
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
        name="index"
        options={{
          // Hide back by default + disable iOS swipe-back
          header: () => (
            <CustomHeader
              title="Бронь без привязки к курсу"
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
              title="Бронь с привязкой к курсу"
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
          header: () => (
            <CustomHeader
              title="В обработке"
              showBackButton={true}
              onBack={() => router.replace("/(tabs)/(main)")}
            />
          ),
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
