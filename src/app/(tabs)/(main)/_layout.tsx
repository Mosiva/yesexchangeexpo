import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

function CustomHeader({
  title,
  showBackButton = false,
}: {
  title: string;
  showBackButton: boolean;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  return (
    <View style={s.topBar}>
      {showBackButton && (
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </Pressable>
      )}
      <Text style={s.title}>{title}</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <CustomHeader title="" showBackButton={false} />,
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
      paddingTop: 30,
      backgroundColor: "#F79633",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
  });
