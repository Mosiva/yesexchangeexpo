import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const mockPartners = [
  {
    id: "1",
    name: "Cynic",
    latitude: 51.126,
    longitude: 71.43,
    distance: "1.2 km",
    address: "Мангилик ел 8",
  },
  {
    id: "2",
    name: "Lyric",
    latitude: 51.13,
    longitude: 71.44,
    distance: "2.5 km",
    address: "Достык 20",
  },
];

export default function NearbyScreen() {
  const [region] = useState({
    latitude: 51.13,
    longitude: 71.44,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Бары</Text>

      <MapView style={styles.map} initialRegion={region} showsUserLocation>
        {mockPartners.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.address}
          />
        ))}
      </MapView>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Поиск баров" />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Фильтр</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockPartners}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text>{item.address}</Text>
                <Text style={styles.distance}>{item.distance}</Text>
              </View>
              <TouchableOpacity
                style={styles.iconWrapper}
                onPress={() => {
                  // Optional: Link to maps or focus the marker
                  console.log("Navigate to:", item.name);
                }}
              >
                <Ionicons
                  name="navigate-circle-outline"
                  size={24}
                  color="#4F7942"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 200,
  },
  searchRow: {
    flexDirection: "row",
    padding: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  filterButton: {
    backgroundColor: "#D4AF37",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  distance: {
    marginTop: 4,
    color: "#666",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrapper: {
    paddingLeft: 10,
  },
});
