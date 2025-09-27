import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CurrenciesMainCardList from "../../../components/CurrenciesMainCardList.tsx";

export default function MainScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: "/(stacks)/settings" });
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* === Header === */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image
            source={require("../../../../assets/images/white-icon.png")} // ← put your white logo here
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Pressable
            hitSlop={12}
            accessibilityLabel="Настройки"
            onPress={handlePress}
          >
            <Ionicons name="settings" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* === Address card (new) === */}
        <View style={styles.addressCard}>
          <Ionicons
            name="location-sharp"
            size={28}
            color="#fff"
            style={styles.addrIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.addrLabel}>Адрес</Text>
            <Text style={styles.addrValue}>Астана, Аэропорт</Text>
          </View>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.localtime}>20 августа 2025 18:48</Text>{" "}
        </View>
        <CurrenciesMainCardList
          data={[
            { code: "USD", buy: "1 533,4", sell: "1 535,8", flagEmoji: "🇺🇸" },
            { code: "EUR", buy: "1243,4", sell: "1245,8", flagEmoji: "🇪🇺" },
            { code: "RUB", buy: "533,4", sell: "535,8", flagEmoji: "🇷🇺" },
            { code: "CNY", buy: "23,4", sell: "27,8", flagEmoji: "🇨🇳" },
            { code: "AED", buy: "12 453,4", sell: "12 455,8", flagEmoji: "🇦🇪" },
            { code: "TRY", buy: "12 453,4", sell: "12 455,8", flagEmoji: "🇹🇷" },
            { code: "KZT", buy: "145,4", sell: "145,8", flagEmoji: "🇰🇿" },
          ]}
          onPressInfo={(code) => console.log("info", code)}
          onPressMore={() => console.log("more")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#F79633",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0, // header spans edge-to-edge
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F79633",
    paddingTop: 56, // or use safe area if you prefer
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerLogo: {
    height: 60, // tweak to your asset
    width: 101,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryCard: {
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  categoryTitle: {
    fontSize: 14,
    color: "#4F7942",
    fontWeight: "700",
  },
  promoScroll: {
    marginBottom: 20,
  },
  promoCard: {
    width: 280,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#eee",
  },
  promoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  promoText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  restaurantDesc: {
    fontSize: 14,
    color: "#555",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAll: {
    fontSize: 16,
    color: "#D4AF37",
    fontWeight: "bold",
  },
  restaurantInfoRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  login: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4F7942",
  },
  addressCard: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7AC61",
    marginBottom: 12,
  },
  addrIcon: { marginRight: 12 },
  addrLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.95,
    marginBottom: 4,
    fontWeight: "400",
  },
  addrValue: { color: "#fff", fontSize: 16, fontWeight: "400" },
  localtime: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
});
