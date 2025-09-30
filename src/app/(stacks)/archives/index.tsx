import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import LineUpDownChartCard from "../../../components/LineUpDownChartCard";

export default function ArchivesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <LineUpDownChartCard
          items={[
            { code: "USD", value: 544.36, delta: +23.2, flagEmoji: "🇺🇸" },
            { code: "RUB", value: 6.53, delta: -23.2, flagEmoji: "🇷🇺" },
            { code: "EUR", value: 637.0, delta: +23.2, flagEmoji: "🇪🇺" },
            { code: "KZT", value: 1.0, delta: +23.2, flagEmoji: "🇰🇿" },
          ]}
          expanded={true}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
