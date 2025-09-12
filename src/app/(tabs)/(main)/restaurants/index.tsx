import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RestaurantsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { id: "all", title: "All" },
    { id: "italian", title: "Italian" },
    { id: "french", title: "French" },
    { id: "kazakh", title: "Kazakh" },
  ];

  const restaurants = [
    {
      id: 1,
      name: "La Dolce Vita",
      category: "italian",
      description: "Authentic Italian cuisine with handmade pasta.",
      hours: "10:00–22:00",
      distance: "1.2 км",
      discount: "18+",
    },
    {
      id: 2,
      name: "Sakura Sushi",
      category: "french",
      description: "Fresh sushi and Japanese specialties daily.",
      hours: "11:00–23:00",
      distance: "2.5 км",
      discount: "22+",
    },
    {
      id: 3,
      name: "Green Fork",
      category: "kazakh",
      description: "Healthy and organic meals with vegan options.",
      hours: "08:00–20:00",
      distance: "900 м",
      discount: "21+",
    },
  ];

  const filteredRestaurants = restaurants.filter((rest) => {
    const matchesSearch = rest.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || selectedCategory === "all"
        ? true
        : rest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={styles.container}>
      {/* Categories */}

      {/* Search Input */}
      <TextInput
        placeholder="Поиск бара..."
        placeholderTextColor="#aaa"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryBadge,
              selectedCategory === cat.id && styles.categoryBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Restaurant List */}
      {filteredRestaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          onPress={() =>
            router.push({
              pathname: "/restaurants/[id]",
              params: {
                id: restaurant.id.toString(),
                name: restaurant.name,
                description: restaurant.description,
                hours: restaurant.hours,
                distance: restaurant.distance,
                discount: restaurant.discount,
              },
            })
          }
        >
          <View style={styles.restaurantCard}>
            <Ionicons name="restaurant-outline" size={24} color="#A52A2A" />
            <View style={styles.restaurantInfo}>
              <View style={styles.infoHeader}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{restaurant.discount}</Text>
                </View>
              </View>
              <Text style={styles.restaurantDesc}>
                {restaurant.description}
              </Text>
              <View style={styles.subInfoRow}>
                <Text style={styles.subInfoText}>{restaurant.hours}</Text>
                <Text style={styles.subInfoText}>{restaurant.distance}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryBadgeActive: {
    backgroundColor: "#D4AF37",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
  },
  restaurantDesc: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subInfoRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 12,
  },
  subInfoText: {
    fontSize: 14,
    color: "#888",
  },
  discountBadge: {
    backgroundColor: "#333333",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
