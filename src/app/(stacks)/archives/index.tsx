import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LineUpDownChartCard from "../../../components/LineUpDownChartCard";
import { Skeleton } from "../../../components/skeleton";
import { useTheme } from "../../../hooks/useTheme";
import { useNbkRatesHistoryQuery } from "../../../services/yesExchange";
import {
  dmyLocal,
  pickLatestPerCode,
  ymdLocal,
} from "../../../utils/nbkDateUtils";
/* ================= Helpers ================= */

export default function ArchivesScreen() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const { branchId } = useLocalSearchParams<{ branchId: string }>();

  const {
    data: rawNbkRatesHistory,
    refetch: refetchNbkRatesHistory,
    isLoading: isNbkRatesHistoryLoading,
    isError: isNbkRatesHistoryError,
  } = useNbkRatesHistoryQuery({});

  // 1) Фильтруем только сегодняшние записи
  const todayYMD = ymdLocal();
  const todayDMY = dmyLocal();

  const todayOnly = useMemo(() => {
    const arr = Array.isArray(rawNbkRatesHistory) ? rawNbkRatesHistory : [];
    const todays = arr.filter((r: any) => {
      const s = String(r?.date ?? "");
      return s === todayYMD || s === todayDMY;
    });

    // 2) Если за сегодня ничего не пришло, падаем на «самую свежую на код»
    if (todays.length === 0) {
      return pickLatestPerCode(arr);
    }
    // На всякий: если по одному коду пришли и сегодня/вчера, оставим только сегодняшнюю запись
    return pickLatestPerCode(todays);
  }, [rawNbkRatesHistory, todayYMD, todayDMY]);

  // 3) Приводим к items для LineUpDownChartCard
  const nbkItems = useMemo(() => {
    return (Array.isArray(todayOnly) ? todayOnly : []).map((r: any) => ({
      code: r.currency?.code ?? "",
      value: r.rate,
      delta: Number(r.change.toFixed(2)) || 0,
      label: t("archives.nbkRate", "Курс НБ РК"),
      name: r.currency?.name ?? "",
      trend: r.trend ?? "same",
      history: Array.isArray(r.history)
      ? r.history.slice(0, 6)
      : [],
    }));
  }, [todayOnly]);

  // Поиск по коду/названию
  const filteredItems = useMemo(() => {
    if (!query.trim()) return nbkItems;
    const q = query.trim().toLowerCase();
    return nbkItems.filter((i) => {
      const code = i.code?.toLowerCase() ?? "";
      const name = i.name?.toLowerCase() ?? "";
      return code.includes(q) || name.includes(q);
    });
  }, [query, nbkItems]);

  // === Обновление данных ===
  const refetchAllData = useCallback(async () => {
    await refetchNbkRatesHistory();
  }, [refetchNbkRatesHistory]);

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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />

      {/* 🔎 Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.subtext}
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={query}
          onChangeText={(t) => setQuery(t)}
          placeholder={t(
            "archives.searchByCurrencyName",
            "Поиск: USD / Доллар"
          )}
          placeholderTextColor={colors.subtext}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* ✅ FlatList */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        renderItem={({ item }) => (
          <LineUpDownChartCard items={[item]} initial={1} branchId={branchId} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isNbkRatesHistoryLoading ? (
            <View style={styles.skeletonContainer}>
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
            </View>
          ) : isNbkRatesHistoryError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t(
                  "archives.errorLoadingNbkRatesHistory",
                  "Ошибка загрузки истории курсов НБК"
                )}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchNbkRatesHistory()}
              >
                <Text style={styles.retryButtonText}>
                  {t("archives.retry", "Повторить")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#6B7280" }}>
                {t("archives.nothingFound", "Ничего не найдено по запросу")} “
                {query}”
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

/* ================= Styles ================= */

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    searchContainer: {
      marginTop: 10,
      marginBottom: 10,
      marginHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      color: colors.text,
    },

    skeletonContainer: {
      paddingHorizontal: 16,
      gap: 12,
      paddingTop: 12,
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
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryButtonText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  });
