import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { useRefetchOnLanguageChange } from "../../../hooks/useRefetchOnLanguageChange";
import { useTheme } from "../../../hooks/useTheme";
import { useUserLocation } from "../../../hooks/useUserLocation";
import { useAuth } from "../../../providers/Auth";
import {
  useBranchesQuery,
  useExchangeRatesCurrentQuery,
  useGetFavoriteCurrenciesQuery,
  useNbkRatesQuery,
  useNearestBranchQuery,
  useNewsQuery,
} from "../../../services/yesExchange";
import { CurrencyCode } from "../../../types/api";
import {
  dmyLocal,
  pickLatestPerCode,
  ymdLocal,
} from "../../../utils/nbkDateUtils";

// === Вспомогательные функции ===

// вчерашняя дата в формате YYYY-MM-DD
const getYesterdayDate = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Текущее локальное время
const LocalTime = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const styles = makeStyles(colors);
  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const nominativeMonths = t("datepicker.months", {
    returnObjects: true,
  }) as string[];

  // функция для заглавной буквы
  function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // язык, для которого применяем склонение
  const isSlavicLike =
    i18n.language.startsWith("ru") || i18n.language.startsWith("kz");

  const genitiveMonths = nominativeMonths.map((m) => {
    // 🇷🇺 🇰🇿 → применяем склонение
    if (isSlavicLike) {
      return m
        .toLowerCase()
        .replace("ь", "я") // Январь → января
        .replace("й", "я") // Май → мая
        .replace("т", "та"); // Август → августа
    }

    // 🇬🇧🇺🇸 en → просто с большой буквы
    return capitalize(m);
  });

  const day = String(now.getDate()).padStart(2, "0");
  const month = genitiveMonths[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return (
    <Text style={styles.localtime}>
      {day} {month} {year} {hours}:{minutes}
    </Text>
  );
};
export default function MainScreen() {
  const { location, loading, permissionDenied } = useUserLocation();
  const [refreshing, setRefreshing] = useState(false);
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);
  const { isGuest } = useAuth();
  // usePushNotifications(isGuest);
  const {
    data: favoriteCurrencies,
    refetch: refetchFavoriteCurrencies,
    isLoading: isFavoriteCurrenciesLoading,
    isError: isFavoriteCurrenciesError,
  } = useGetFavoriteCurrenciesQuery(undefined, {
    skip: isGuest, // 👈 если гость — запрос НЕ выполнится
  });
  const favoriteCurrenciesData =
    !isGuest && Array.isArray(favoriteCurrencies) ? favoriteCurrencies : [];

  // === API ===
  const {
    data: rawBranches,
    refetch: refetchBranches,
    isLoading: isBranchesLoading,
    isError: isBranchesError,
  } = useBranchesQuery();
  const {
    data: rawNews,
    refetch: refetchNews,
    isLoading: isNewsLoading,
    isError: isNewsError,
  } = useNewsQuery({
    limit: 4,
  });
  // === API ===
  const {
    data: rawNearestBranch,
    refetch: refetchNearestBranch,
    isLoading: isNearestBranchLoading,
    isError: isNearestBranchError,
  } = useNearestBranchQuery(
    {
      lng: location?.coords.longitude ?? 0,
      lat: location?.coords.latitude ?? 0,
    },
    {
      skip: !location, // ⏳ не делаем запрос, пока не получили координаты
    }
  );

  const yesterdayDate = getYesterdayDate();
  const todayDate = getTodayDate();

  const {
    data: rawNbkRates,
    refetch: refetchNbkRates,
    isLoading: isNbkRatesLoading,
    isError: isNbkRatesError,
  } = useNbkRatesQuery({
    from: yesterdayDate,
    to: todayDate,
    limit: 30,
  });

  const branches = React.useMemo(() => {
    return Array.isArray(rawBranches) ? rawBranches : [];
  }, [rawBranches]);

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"archive" | "news">("archive");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [exchangeVisible, setExchangeVisible] = useState(false);
  const [exchangeData, setExchangeData] = useState<{
    type: "buy" | "sell";
    rate: any;
  } | null>(null);

  const exchangeQueryArgs: any = {
    branchId: selectedBranch?.id?.toString() || "",
    limit: 100,
  };

  if (!isGuest) {
    exchangeQueryArgs.currencyCodes = favoriteCurrenciesData;
  }

  const {
    data: rawExchangeRates,
    refetch: refetchExchangeRates,
    isLoading: isExchangeRatesLoading,
    isError: isExchangeRatesError,
  } = useExchangeRatesCurrentQuery(exchangeQueryArgs, {
    skip: !selectedBranch?.id || isBranchesLoading,
  });

  // 1) При появлении геолокации — обновляем nearest branch
  useEffect(() => {
    if (location) {
      refetchNearestBranch();
    }
  }, [location]);
  useRefetchOnLanguageChange([
    async () => {
      const prev = selectedBranch; // запоминаем

      setSelectedBranch(null);
      await refetchBranches();

      // Если был выбран филиал ДО смены языка — выбираем тот же по id
      if (prev?.id && Array.isArray(rawBranches)) {
        const updated = rawBranches.find((b) => b.id === prev.id);
        if (updated) {
          setSelectedBranch(updated); // 👈 теперь city/address обновятся
        }
      }

      if (location) {
        await refetchNearestBranch();
      }

      await refetchAllData();
    },
  ]);
  useEffect(() => {
    if (!selectedBranch) return;
    if (!Array.isArray(branches)) return;

    const updated = branches.find((b) => b.id === selectedBranch.id);
    if (updated) {
      setSelectedBranch(updated);
    }
  }, [branches]);

  const exchangeRates = rawExchangeRates?.data || [];
  const news = rawNews?.data || [];

  // ✅ NBRK items safe filtered (only today)
  const nbkItems = React.useMemo(() => {
    const arr = Array.isArray(rawNbkRates) ? rawNbkRates : [];

    const todayYMD = ymdLocal();
    const todayDMY = dmyLocal();

    const todays = arr.filter((r: any) => {
      const s = String(r?.date ?? "");
      return s === todayYMD || s === todayDMY;
    });

    const latestRows =
      todays.length > 0 ? pickLatestPerCode(todays) : pickLatestPerCode(arr);

    return latestRows.map((r: any) => ({
      code: r.currency?.code ?? "",
      value: r.rate,
      delta: Number(r.changePercent) || 0,
      label: t("main.nbkRatesLabel", "Курс НБ РК"),
      name: r.currency?.name ?? "",
    }));
  }, [rawNbkRates]);

  const newsItems = React.useMemo(() => {
    return news.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.excerpt as string,
      date: n.createdAt,
      source: n.source,
    }));
  }, [news]);

  React.useEffect(() => {
    // 🕓 1️⃣ Идёт загрузка ближайшего филиала
    if (isNearestBranchLoading && !selectedBranch) {
      console.log("🕓 Определяем ближайший филиал по геолокации...");
      return;
    }

    // 🟢 2️⃣ Успешно нашли ближайший филиал
    if (
      !selectedBranch &&
      !permissionDenied &&
      !isNearestBranchLoading &&
      rawNearestBranch?.id
    ) {
      console.log(
        "📍 Геолокация активна — выбран ближайший филиал:",
        rawNearestBranch.city,
        "|",
        rawNearestBranch.address
      );
      setSelectedBranch(rawNearestBranch);
      return;
    }

    // ⚠️ 3️⃣ Ошибка при получении ближайшего филиала
    if (isNearestBranchError && !permissionDenied && !selectedBranch) {
      console.log(
        "⚠️ Ошибка при запросе ближайшего филиала, используем fallback."
      );
    }

    // 🚫 4️⃣ Геолокация отключена — выбираем дефолтный филиал
    if (
      (permissionDenied || isNearestBranchError) &&
      Array.isArray(rawBranches) &&
      rawBranches.length > 0 &&
      !selectedBranch
    ) {
      const normalizedBranches = rawBranches.map((b) => ({
        ...b,
        city: typeof b.city === "string" ? b.city : "",
      }));

      const astanaBranches = normalizedBranches.filter(
        (b) =>
          b.city?.toLowerCase().includes("астан") ||
          b.city?.toLowerCase().includes("astan")
      );

      const defaultBranch =
        astanaBranches.length > 0 ? astanaBranches[0] : normalizedBranches[0];

      console.log(
        "📍 Геолокация недоступна — выбран дефолтный филиал:",
        defaultBranch.city,
        "|",
        defaultBranch.address
      );

      setSelectedBranch(defaultBranch);
    }

    // 💤 5️⃣ Если всё ещё ничего не выбрано (например, очень ранний рендер)
    if (!selectedBranch && !isNearestBranchLoading && !permissionDenied) {
      console.log("🕓 Ожидание данных о филиалах...");
    }
  }, [
    rawNearestBranch,
    isNearestBranchLoading,
    isNearestBranchError,
    permissionDenied,
    rawBranches,
    selectedBranch,
  ]);

  // === Обновление данных ===
  const refetchAllData = useCallback(async () => {
    await Promise.all([
      refetchBranches(),
      refetchNbkRates(),
      refetchExchangeRates(),
      refetchNearestBranch(),
      refetchNews(),
    ]);
  }, [
    refetchBranches,
    refetchNbkRates,
    refetchExchangeRates,
    refetchNearestBranch,
    refetchNews,
  ]);

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

  // === Handlers ===
  const handlePressSettings = () =>
    router.push({ pathname: "/(stacks)/settings" });
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
  const filteredExchangeRates = exchangeRates.filter(
    (c) => c.currency.code !== "KZT"
  );
  // === Render ===
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image
            source={require("../../../../assets/images/Logo1.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Pressable hitSlop={12} onPress={handlePressSettings}>
            <Ionicons name="settings" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* === Карточка адреса филиала === */}
        {isBranchesLoading ? (
          <View style={styles.addressCard}>
            <Ionicons
              name="location-sharp"
              size={28}
              color="#fff"
              style={styles.addrIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.addrLabel}>
                {t("main.addressLabel", "Адрес")}
              </Text>
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
              <Text style={styles.addrLabel}>
                {t("main.addressLabel", "Адрес")}
              </Text>
              <Text style={styles.errorText}>
                {t("main.errorLoadingBranches", "Ошибка загрузки филиалов")}
              </Text>
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
              <Text style={styles.addrLabel}>
                {t("main.addressLabel", "Адрес")}
              </Text>

              {/* 🏦 Основной адрес */}
              <Text style={styles.addrValue}>
                {selectedBranch
                  ? `${selectedBranch.city}, ${selectedBranch.address}`
                  : t("main.selectBranch", "Выберите филиал")}
              </Text>

              {/* 💬 Подпись под адресом */}
              {isNearestBranchLoading ? (
                <Text style={styles.addrHint}>
                  {t(
                    "main.determiningNearestBranch",
                    "Определяем ближайший филиал..."
                  )}
                </Text>
              ) : permissionDenied ? (
                <Text style={styles.addrHint}>
                  {t("main.defaultBranch", "Филиал по умолчанию (Астана)")}
                </Text>
              ) : isNearestBranchError ? (
                <Text style={styles.addrHint}>
                  {t(
                    "main.errorDeterminingNearestBranch",
                    "Не удалось определить ближайший филиал"
                  )}
                </Text>
              ) : selectedBranch?.id === rawNearestBranch?.id ? (
                <Text style={styles.addrHint}>
                  {t(
                    "main.nearestBranchByLocation",
                    "Ближайший филиал по вашему местоположению"
                  )}
                </Text>
              ) : (
                <Text style={styles.addrHint}>
                  {t("main.selectedBranchManually", "Выбран филиал вручную")}
                </Text>
              )}
            </View>

            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LocalTime />
        </View>

        {/* === Курсы валют === */}
        {isExchangeRatesLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
          </View>
        ) : isExchangeRatesError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {t(
                "main.errorLoadingExchangeRates",
                "Ошибка загрузки курсов валют"
              )}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchExchangeRates()}
            >
              <Text style={styles.retryButtonText}>
                {t("main.retry", "Повторить")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CurrenciesMainCardList
            data={filteredExchangeRates.map((rate) => ({
              code: rate.currency.code as CurrencyCode,
              name: rate.currency.name,
              buy: rate.buy.toString(),
              sell: rate.sell.toString(),
            }))}
            onPressExchange={handlePressExchange}
            onPressMore={() => console.log("more")}
          />
        )}
      </View>

      {/* === Tabs === */}
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
            {t("main.archive", "Архив")}
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
            {t("main.news", "Новости")}
          </Text>
        </Pressable>
      </View>

      {/* === Контент вкладок === */}
      {activeTab === "news" ? (
        isNewsLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
            <Skeleton width="90%" height={60} style={styles.skeletonItem} />
          </View>
        ) : isNewsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {t("main.errorLoadingNews", "Ошибка загрузки новостей")}
            </Text>
          </View>
        ) : (
          <NewsMainCardList items={newsItems} initial={3} />
        )
      ) : isNbkRatesLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton width="90%" height={60} style={styles.skeletonItem} />
          <Skeleton width="90%" height={60} style={styles.skeletonItem} />
          <Skeleton width="90%" height={60} style={styles.skeletonItem} />
        </View>
      ) : isNbkRatesError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("main.errorLoadingNbkRates", "Ошибка загрузки курсов НБК")}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchNbkRates()}
          >
            <Text style={styles.retryButtonText}>
              {t("main.retry", "Повторить")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LineUpDownChartCard items={nbkItems} branchId={selectedBranch?.id} />
      )}

      <View style={{ marginBottom: 16, paddingHorizontal: 10 }}>
        <ReservePromoCard onPress={() => router.push("/(tabs)/reserve")} />
      </View>
      {exchangeData && (
        <CurrencyExchangeModal
          visible={exchangeVisible}
          onClose={() => setExchangeVisible(false)}
          onConfirm={() => setExchangeVisible(false)}
          mode={exchangeData.type}
          fromCode={exchangeData.rate.code}
          fromName={exchangeData.rate.name ?? exchangeData.rate.code}
          toCode="KZT"
          rate={
            exchangeData.type === "sell"
              ? Number(exchangeData.rate.sell)
              : Number(exchangeData.rate.buy)
          }
          branchId={selectedBranch?.id}
          address={selectedBranch?.address}
        />
      )}

      {/* === Выпадающий список филиалов === */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>
              {t("main.selectBranch", "Выберите филиал")}
            </Text>
            <FlatList
              data={Array.isArray(branches) ? branches : []}
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

// === Стили ===
const makeStyles = (colors: any) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: "#F79633",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      overflow: "hidden",
    },
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#F79633",
      paddingTop: 10,
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
    addrLabel: { color: "#fff", fontSize: 14, opacity: 0.95, marginBottom: 4 },
    addrValue: { color: "#fff", fontSize: 14 },
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
      backgroundColor: colors.background,
    },
    tabActive: { backgroundColor: colors.tabActive },
    tabText: { color: colors.subtext, fontSize: 16, fontWeight: "700" },
    tabTextActive: { color: colors.text },
    tabTextMuted: { color: colors.subtext },
    dropdownIcon: { marginLeft: 8 },
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
    dropdownItemSelected: { backgroundColor: "#FEF3E7" },
    dropdownItemContent: { flex: 1 },
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
    dropdownItemPhone: { fontSize: 12, color: "#9CA3AF" },
    skeletonContainer: { paddingHorizontal: 16, gap: 12 },
    skeletonItem: { borderRadius: 12, marginBottom: 8 },
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
    retryButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    retryButtonSmall: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 6,
      marginLeft: 8,
    },
    addrHint: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 12,
      marginTop: 2,
      opacity: 0.8,
    },
  });
