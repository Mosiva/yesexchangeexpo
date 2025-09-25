import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      ></ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
