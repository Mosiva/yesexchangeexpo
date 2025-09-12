import { ScrollView, StyleSheet, Text } from "react-native";

export default function UserHistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>История пользователя</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
});
