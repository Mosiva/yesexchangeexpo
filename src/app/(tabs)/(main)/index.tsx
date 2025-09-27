import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import CurrencyExchangeModal from "../../../components/CurrencyExchangeModal";

export default function MainScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [exchangeVisible, setExchangeVisible] = useState(false);
  const [exchangeData, setExchangeData] = useState<{
    type: "buy" | "sell";
    rate: any;
  } | null>(null);

  const handlePress = () => {
    router.push({ pathname: "/(stacks)/settings" });
  };

  const handlePressExchange = (payload: {
    type: "buy" | "sell";
    rate: any;
  }) => {
    setExchangeData(payload);
    setExchangeVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image
            source={require("../../../../assets/images/white-icon.png")}
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
          <Text style={styles.localtime}>20 августа 2025 18:48</Text>
        </View>

        <CurrenciesMainCardList
          data={[
            { code: "USD", buy: "544.36", sell: "549.36", flagEmoji: "🇺🇸" },
            { code: "EUR", buy: "637.00", sell: "642.00", flagEmoji: "🇪🇺" },
            { code: "RUB", buy: "6.53", sell: "11.53", flagEmoji: "🇷🇺" },
            { code: "CNY", buy: "76.31", sell: "81.31", flagEmoji: "🇨🇳" },
            { code: "AED", buy: "148.21", sell: "153.21", flagEmoji: "🇦🇪" },
            { code: "TRY", buy: "13.06", sell: "18.06", flagEmoji: "🇹🇷" },
            { code: "KZT", buy: "1.00", sell: "1.00", flagEmoji: "🇰🇿" },
          ]}
          onPressExchange={handlePressExchange}
          onPressMore={() => console.log("more")}
        />
      </View>
      {exchangeData && (
        <CurrencyExchangeModal
          visible={exchangeVisible}
          onClose={() => setExchangeVisible(false)}
          onConfirm={(payload) => {
            console.log("Бронь", payload);
            setExchangeVisible(false);
          }}
          mode={exchangeData.type} // 👈 добавил
          fromCode={exchangeData.rate.code}
          fromName={exchangeData.rate.name ?? exchangeData.rate.code}
          toCode="KZT"
          rate={
            exchangeData.type === "sell"
              ? Number(exchangeData.rate.sell)
              : Number(exchangeData.rate.buy)
          }
          fromSymbol={exchangeData.rate.code === "USD" ? "$" : "₽"} // 👈 пока грубо, потом можно маппинг сделать
          toSymbol="₸"
          flagEmoji={exchangeData.rate.flagEmoji}
        />
      )}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F79633",
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerLogo: { height: 60, width: 101 },
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
