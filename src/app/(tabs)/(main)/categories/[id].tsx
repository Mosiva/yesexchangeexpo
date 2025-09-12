import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const restaurants = [
  {
    id: 1,
    name: "Cynic",
    category: "italian",
    description: "Авторские коктейли и уютная атмосфера.",
    hours: "19:00–3:00",
    distance: "1.2 км",
    discount: "21+",
    image: require("../../../../../assets/mock/frres.png"),
  },
  {
    id: 2,
    name: "Lyric",
    category: "french",
    description: "Музыка, танцы и вечеринки до утра.",
    hours: "22:00–4:00",
    distance: "2.5 км",
    discount: "24+",
    image: require("../../../../../assets/mock/itres.png"),
  },
  {
    id: 3,
    name: "Satyric",
    category: "kazakh",
    description: "Лаунж-зона и стильные вечерние посиделки.",
    hours: "20:00–3:00",
    distance: "900 м",
    discount: "18+",
    image: require("../../../../../assets/mock/itres.png"),
  },
];

export default function CategoryRestaurants() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{name}</Text>
      {restaurants.map((rest) => (
        <TouchableOpacity
          key={rest.id}
          onPress={() =>
            router.push({
              pathname: "/restaurants/[id]",
              params: {
                id: rest.id.toString(),
                name: rest.name,
                description: rest.description,
                hours: rest.hours,
                distance: rest.distance,
                discount: rest.discount,
              },
            })
          }
        >
          <Image source={rest.image} style={styles.image} />
          {rest.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{rest.discount}</Text>
            </View>
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{rest.name}</Text>
            <Text style={styles.description}>{rest.description}</Text>
            <View style={styles.row}>
              <Text style={styles.deliveryTime}>{rest.distance}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#333333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "#555",
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#555",
  },
});
