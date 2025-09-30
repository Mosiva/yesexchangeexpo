import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function ArchiveDetailCard({
  title,
  date,
  content,
  image,
}: Props) {
  const router = useRouter();

  return <ScrollView style={styles.container} bounces></ScrollView>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
});
