import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="categories/index"
        options={{
          header: () => <CustomHeader title="Gastro | Pass" />,
        }}
      />
      <Stack.Screen
        name="categories/[id]"
        options={{
          header: () => <CustomHeader title="Gastro | Pass" />,
        }}
      />
      <Stack.Screen
        name="restaurants/index"
        options={{
          header: () => <CustomHeader title="Gastro | Pass" />,
        }}
      />
      <Stack.Screen
        name="restaurants/[id]"
        options={{
          header: () => <CustomHeader title="Gastro | Pass" />,
        }}
      />
      <Stack.Screen
        name="restaurants/[id]/reserve"
        options={{
          header: () => <CustomHeader title="Gastro | Pass" />,
        }}
      />
      <Stack.Screen
        name="(settings)"
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
    fontWeight: "bold",
    color: "#4F7942",
  },
});
