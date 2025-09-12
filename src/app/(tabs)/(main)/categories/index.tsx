import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  {
    id: "1",
    title: "Лаунж",
    count: 16,
    image: require("../../../../../assets/mock/breakfast.png"),
  },
  {
    id: "2",
    title: "Караоке",
    count: 27,
    image: require("../../../../../assets/mock/breakfast.png"),
  },
  {
    id: "3",
    title: "Коктейль",
    count: 120,
    image: require("../../../../../assets/mock/breakfast.png"),
  },
  {
    id: "4",
    title: "Паб",
    count: 76,
    image: require("../../../../../assets/mock/breakfast.png"),
  },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t("mainpass.categories")}</Text>
      <View style={styles.grid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/categories/[id]",
                params: {
                  id: cat.id.toString(),
                  name: cat.title,
                },
              })
            }
          >
            <Image source={cat.image} style={styles.image} />
            <Text style={styles.title}>{cat.title}</Text>
            <Text style={styles.count}>{cat.count} заведений</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
    marginTop: 10,
  },
  count: {
    fontSize: 14,
    color: "#555",
    marginHorizontal: 10,
    marginBottom: 10,
  },
});
