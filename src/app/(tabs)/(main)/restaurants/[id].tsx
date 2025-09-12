import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const mockImages = [
  require("../../../../../assets/mock/itres.png"),
  require("../../../../../assets/mock/frres.png"),
];

export default function RestaurantDetail() {
  const { id, name, desc, discount, distance, hours } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Image slider */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        contentContainerStyle={styles.sliderContent}
      >
        {mockImages.map((img, index) => (
          <View key={index} style={styles.slideWrapper}>
            <Image source={img} style={styles.sliderImage} />
          </View>
        ))}
      </ScrollView>
      {/* Info Block */}
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{desc}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>🕐 {hours}</Text>
          <Text style={styles.meta}>📍 {distance}</Text>
          <Text style={styles.meta}>21+</Text>
        </View>
        <Text style={styles.longDesc}>
          Добро пожаловать в {name}! Здесь вас ждут авторские коктейли, широкий
          выбор напитков и закусок. Атмосфера нашего бара создана для того,
          чтобы вы могли расслабиться, пообщаться с друзьями и отлично провести
          время. Будь то шумная вечеринка или спокойный вечер в компании — у нас
          всегда найдётся подходящий формат отдыха.
        </Text>
      </View>
      {/* Navigate Button */}
      <Pressable
        style={styles.navigateButton}
        onPress={() =>
          router.push({
            pathname: "/restaurants/[id]/reserve",
            params: { id: String(id), name: String(name) },
          })
        }
      >
        <Text style={styles.navigateText}>Забронировать столик</Text>
      </Pressable>
      {/* ID for debug/dev */}
      <Text style={styles.devInfo}>Restaurant ID: {id}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  infoBlock: {
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  desc: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 14,
    color: "#777",
  },
  navigateButton: {
    backgroundColor: "#4F7942",
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  navigateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  devInfo: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#bbb",
  },
  longDesc: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  slider: {
    height: 220,
    marginBottom: 20,
  },
  sliderContent: {
    paddingHorizontal: 20,
  },
  slideWrapper: {
    width: 320,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
