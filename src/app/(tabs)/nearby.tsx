import {
  StyleSheet,
  Text,
  View
} from "react-native";

export default function NearbyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Обменики</Text>
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
