import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "providers";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { clientApi } from "services";

const { useGetClientQuery } = clientApi;
const categories = [
  {
    id: "1",
    title: "Лаунж",
    count: 16,
    icon: require("../../../../assets/mock/lounge.png"),
  },
  {
    id: "2",
    title: "Караоке",
    count: 27,
    icon: require("../../../../assets/mock/karaoke.png"),
  },
  {
    id: "3",
    title: "Коктейль",
    count: 120,
    icon: require("../../../../assets/mock/cocktails.png"),
  },
  {
    id: "4",
    title: "Паб",
    count: 76,
    icon: require("../../../../assets/mock/pub.png"),
  },
];

const promos = [
  {
    id: "1",
    image: require("../../../../assets/mock/itres.png"),
    title: "Cynic",
    desc: "Best Italian Food",
    hours: "10:00–22:00",
    distance: "1.2 км",
    discount: "-10%",
  },
  {
    id: "2",
    image: require("../../../../assets/mock/frres.png"),
    title: "Lyric",
    desc: "French Cuisine",
    hours: "09:00–21:00",
    distance: "2.5 км",
    discount: "-20%",
  },
];

const restaurants = [
  {
    id: "1",
    name: "Cynic",
    desc: "Авторские коктейли",
    hours: "20:00–2:00",
    distance: "1.2 км",
    discount: "-10%",
    image: require("../../../../assets/icons/rr.png"),
  },
  {
    id: "2",
    name: "Lyric",
    desc: "Музыка и танцы",
    hours: "22:00–3:00",
    distance: "2.5 км",
    discount: "-20%",
    image: require("../../../../assets/icons/tt.png"),
  },
];

export default function MainScreen() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const router = useRouter();
  const { logout } = useAuth();

  const {
    data: clientData,
    refetch: refetchClient,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useGetClientQuery({});

  useFocusEffect(
    useCallback(() => {
      refetchClient(); // Re-fetch when screen is focused
    }, [refetchClient])
  );

  const client = clientData?.data || null;
  const handlePress = () => {
    if (isClientError || !client?.first_name) {
      // Just show login screen logic, or do nothing — up to you
      logout();
    } else {
      router.push("/(tabs)/(main)/(settings)");
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchClient();
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.topBar}>
        <Text style={styles.title}>Gastro | Pass</Text>
        <Pressable onPress={handlePress}>
          <Text style={styles.login}>
            {isClientError
              ? t("mainpass.login")
              : client?.first_name ?? t("mainpass.login")}
          </Text>
        </Pressable>
      </View>
      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("mainpass.categories")}</Text>
        <Link href="/categories" push asChild>
          <Text style={styles.viewAll}> {t("mainpass.all")} </Text>
        </Link>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCard}
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
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promo Banner */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.promoScroll}
      >
        {promos.map((promo) => (
          <Link
            key={promo.id}
            href={{
              pathname: "/(tabs)/(main)/restaurants/[id]",
              params: {
                id: promo.id.toString(),
                name: promo.title,
                desc: promo.desc,
                hours: promo.hours,
                distance: promo.distance,
                discount: promo.discount,
              },
            }}
            push
            asChild
          >
            <TouchableOpacity>
              <View key={promo.id} style={styles.promoCard}>
                <Image source={promo.image} style={styles.promoImage} />
                <Text style={styles.promoText}>{promo.title}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}> {t("mainpass.restaurants")}</Text>
        <Link href="/restaurants" push asChild>
          <Text style={styles.viewAll}>{t("mainpass.all")}</Text>
        </Link>
      </View>
      {restaurants.map((rest) => (
        <Link
          key={rest.id}
          href={{
            pathname: "/(tabs)/(main)/restaurants/[id]",
            params: {
              id: rest.id.toString(),
              name: rest.name,
              desc: rest.desc,
              hours: rest.hours,
              distance: rest.distance,
              discount: rest.discount,
            },
          }}
          push
          asChild
        >
          <TouchableOpacity>
            <View style={styles.restaurantCard}>
              <Image source={rest.image} style={styles.restaurantImage} />

              <View style={styles.restaurantInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restaurantName}>{rest.name}</Text>
                  <Text style={styles.restaurantDesc}>{rest.desc}</Text>

                  <View style={styles.subInfoRow}>
                    <Text style={styles.subInfoText}>{rest.hours}</Text>
                    <Text style={styles.subInfoText}>{rest.distance}</Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.discountText}>21+</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
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
});
