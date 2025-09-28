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
import LineUpDownChartCard from "../../../components/LineUpDownChartCard";
import NewsMainCardList from "../../../components/NewsMainCardList.tsx";
import ReservePromoCard from "../../../components/ReservePromoCard";

// Отдельный компонент для локального времени
function LocalTime() {
  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000); // обновляем каждую минуту
    return () => clearInterval(timer);
  }, []);

  return (
    <Text style={styles.localtime}>
      {now.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </Text>
  );
}

export default function MainScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"archive" | "news">("archive");

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

        {/* текущее время */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LocalTime />
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

      {/* Tabs: Архив / Новости */}
      {/* Tabs: Архив / Новости */}
      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tab, activeTab === "archive" && styles.tabActive]}
          onPress={() => setActiveTab("archive")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "archive"
                ? styles.tabTextActive
                : styles.tabTextMuted,
            ]}
          >
            Архив
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "news" && styles.tabActive]}
          onPress={() => setActiveTab("news")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "news" ? styles.tabTextActive : styles.tabTextMuted,
            ]}
          >
            Новости
          </Text>
        </Pressable>
      </View>

      {/* Контент по вкладкам */}
      {activeTab === "news" ? (
        <NewsMainCardList
          onDark={false} // set false if your background is light
          items={[
            {
              id: 1,
              title: "Информационное сообщение по валютному рынку",
              summary:
                "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США.",
              date: "2024-12-24",
            },
            {
              id: 2,
              title: "Информационное сообщение по валютному рынку",
              summary:
                "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США.",
              date: "2024-12-24",
            },
            {
              id: 3,
              title: "Информационное сообщение по валютному рынку",
              summary:
                "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США.",
              date: "2024-12-24",
            },
            {
              id: 4,
              title: "Информационное сообщение по валютному рынку",
              summary:
                "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США.",
              date: "2024-12-24",
            },
            // ...
          ]}
          initial={3}
          onItemPress={(item) => console.log("Open news:", item.id)}
          onMorePress={() => console.log("Expanded")}
        />
      ) : (
        <LineUpDownChartCard
          items={[
            { code: "USD", value: 544.36, delta: +23.2, flagEmoji: "🇺🇸" },
            { code: "RUB", value: 6.53, delta: -23.2, flagEmoji: "🇷🇺" },
            { code: "EUR", value: 637.0, delta: +23.2, flagEmoji: "🇪🇺" },
            { code: "KZT", value: 1.0, delta: +23.2, flagEmoji: "🇰🇿" },
            // …more
          ]}
        />
      )}

      <LineUpDownChartCard
        items={[
          { code: "USD", value: 544.36, delta: +23.2, flagEmoji: "🇺🇸" },
          { code: "RUB", value: 6.53, delta: -23.2, flagEmoji: "🇷🇺" },
          { code: "EUR", value: 637.0, delta: +23.2, flagEmoji: "🇪🇺" },
          { code: "KZT", value: 1.0, delta: +23.2, flagEmoji: "🇰🇿" },
          // …more
        ]}
      />
      <View style={{ marginBottom: 16, paddingHorizontal: 10 }}>
        <ReservePromoCard onPress={() => console.log("Reserve tapped")} />
      </View>

      {exchangeData && (
        <CurrencyExchangeModal
          visible={exchangeVisible}
          onClose={() => setExchangeVisible(false)}
          onConfirm={(payload) => {
            console.log("Бронь", payload);
            setExchangeVisible(false);
          }}
          mode={exchangeData.type}
          fromCode={exchangeData.rate.code}
          fromName={exchangeData.rate.name ?? exchangeData.rate.code}
          toCode="KZT"
          rate={
            exchangeData.type === "sell"
              ? Number(exchangeData.rate.sell)
              : Number(exchangeData.rate.buy)
          }
          fromSymbol={exchangeData.rate.code === "USD" ? "$" : "₽"}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
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
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: "#F9F9F9",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#2F2F2F",
  },
  tabTextMuted: {
    color: "#8E8E93",
  },
});
