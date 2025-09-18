import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "providers";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { clientApi } from "services";

const { useGetClientQuery } = clientApi;

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
    logout();
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
      <StatusBar barStyle="light-content" />
      {/* === Header === */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
