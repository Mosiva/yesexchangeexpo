import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CurrenciesMainCardList from "../../../components/CurrenciesMainCardList.tsx";
import CurrencyExchangeModal from "../../../components/CurrencyExchangeModal";
import LineUpDownChartCard from "../../../components/LineUpDownChartCard";
import NewsMainCardList from "../../../components/NewsMainCardList.tsx";
import ReservePromoCard from "../../../components/ReservePromoCard";
import { Skeleton } from "../../../components/skeleton";
import {
  useBranchesQuery,
  useExchangeRatesCurrentQuery,
  useNbkAverageQuery,
} from "../../../services/yesExchange";

// Функция для получения вчерашней даты в формате YYYY-MM-DD
const getYesterdayDate = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1); // Subtract one day
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${day}-${month}`;
};

// Отдельный компонент для локального времени
const LocalTime = () => {
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
};

export default function MainScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: rawBranches,
    refetch: refetchBranches,
    isLoading: isBranchesLoading,
    isError: isBranchesError,
  } = useBranchesQuery({});

  const yesterdayDate = getYesterdayDate();

  const {
    data: rawNbkAverage,
    refetch: refetchNbkAverage,
    isLoading: isNbkAverageLoading,
    isError: isNbkAverageError,
  } = useNbkAverageQuery({
    from: yesterdayDate,
    to: yesterdayDate,
    limit: 48,
    page: 1,
  });

  const branches = React.useMemo(
    () => rawBranches?.data || [],
    [rawBranches?.data]
  );

  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"archive" | "news">("archive");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [exchangeVisible, setExchangeVisible] = useState(false);
  const [exchangeData, setExchangeData] = useState<{
    type: "buy" | "sell";
    rate: any;
  } | null>(null);

  const {
    data: rawExchangeRates,
    refetch: refetchExchangeRates,
    isLoading: isExchangeRatesLoading,
    isError: isExchangeRatesError,
  } = useExchangeRatesCurrentQuery(
    {
      branchId: selectedBranch?.id.toString() || "",
      page: 1,
      limit: 48,
    },
    {
      skip: !selectedBranch?.id || isBranchesLoading,
    }
  );

  const exchangeRates = rawExchangeRates?.data || [];

  const nbkAverage = rawNbkAverage || [];

  // Set default branch when branches are loaded
  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[1]); // Set index 1 (Астана) as default
    }
  }, [branches, selectedBranch]);

  // Refetch all data function
  const refetchAllData = useCallback(async () => {
    await Promise.all([
      refetchBranches(),
      refetchNbkAverage(),
      refetchExchangeRates(),
    ]);
  }, [refetchBranches, refetchNbkAverage, refetchExchangeRates]);

  // Refetch data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetchAllData();
    }, [refetchAllData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAllData();
    setRefreshing(false);
  };
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

  const handleBranchSelect = (branch: any) => {
    setSelectedBranch(branch);
    setDropdownVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

        {isBranchesLoading ? (
          <View style={styles.addressCard}>
            <Ionicons
              name="location-sharp"
              size={28}
              color="#fff"
              style={styles.addrIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrLabel}>Адрес</Text>
              <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            </View>
          </View>
        ) : isBranchesError ? (
          <View style={styles.addressCard}>
            <Ionicons
              name="location-sharp"
              size={28}
              color="#fff"
              style={styles.addrIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrLabel}>Адрес</Text>
              <Text style={styles.errorText}>Ошибка загрузки филиалов</Text>
            </View>
            <TouchableOpacity
              onPress={() => refetchBranches()}
              style={styles.retryButtonSmall}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => setDropdownVisible(true)}
          >
            <Ionicons
              name="location-sharp"
              size={28}
              color="#fff"
              style={styles.addrIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrLabel}>Адрес</Text>
              <Text style={styles.addrValue}>
                {selectedBranch
                  ? `${selectedBranch.city}, ${selectedBranch.address}`
                  : "Выберите филиал"}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color="#fff"
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        )}

        {/* текущее время */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LocalTime />
        </View>

        {isExchangeRatesLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
          </View>
        ) : isExchangeRatesError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Ошибка загрузки курсов валют</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchExchangeRates()}
            >
              <Text style={styles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CurrenciesMainCardList
            data={exchangeRates.map((rate) => ({
              code: rate.currency,
              buy: rate.buy.toString(),
              sell: rate.sell.toString(),
              flagEmoji: "🇺🇸",
            }))}
            onPressExchange={handlePressExchange}
            onPressMore={() => console.log("more")}
          />
        )}
      </View>

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
          onDark={false}
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
              title: "Курс тенге укрепился к доллару",
              summary:
                "Нацбанк сообщил об изменении коридора и повышении интереса к нотам.",
              date: "2024-12-20",
            },
            {
              id: 3,
              title: "Новые правила обмена валют",
              summary:
                "Обновлены лимиты наличных операций и требования идентификации клиентов.",
              date: "2024-12-15",
            },
            {
              id: 3,
              title: "Новые правила обмена валют",
              summary:
                "Обновлены лимиты наличных операций и требования идентификации клиентов.",
              date: "2024-12-15",
            },
          ]}
          initial={3}
          onItemPress={(item) =>
            router.push({
              pathname: "/(stacks)/news/[id]",
              params: {
                id: String(item.id),
                title: item.title,
                date: item.date.toString(),
                content: item.summary, // пока контент = summary (или подтянешь полный текст)
              },
            })
          }
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

      {/* Branch Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Выберите филиал</Text>
            <FlatList
              data={branches}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedBranch?.id === item.id &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleBranchSelect(item)}
                >
                  <View style={styles.dropdownItemContent}>
                    <Text style={styles.dropdownItemCity}>{item.city}</Text>
                    <Text style={styles.dropdownItemAddress}>
                      {item.address}
                    </Text>
                    <Text style={styles.dropdownItemPhone}>
                      {item.contactPhone}
                    </Text>
                  </View>
                  {selectedBranch?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#F79633" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  dropdownIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    maxHeight: "70%",
    minWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    padding: 20,
    paddingBottom: 10,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#FEF3E7",
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemCity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  dropdownItemAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  dropdownItemPhone: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skeletonItem: {
    borderRadius: 12,
    marginBottom: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  branchSkeleton: {
    marginTop: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  retryButtonSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
});
