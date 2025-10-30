import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
import { useNbkRatesQuery } from "../../../services/yesExchange";
import {
  dmyLocal,
  pickLatestPerCode,
  ymdLocal,
} from "../../../utils/nbkDateUtils";
/* ================= Helpers ================= */

export default function ArchivesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const { branchId } = useLocalSearchParams<{ branchId: string }>();

  const {
    data: rawNbkRates,
    refetch: refetchNbkRates,
    isLoading: isNbkRatesLoading,
    isError: isNbkRatesError,
  } = useNbkRatesQuery({
    from: ymdLocal(new Date(Date.now() - 24 * 3600 * 1000)), // вчера (локально)
    to: ymdLocal(new Date()), // сегодня (локально)
    limit: 30,
  });

  // 1) Фильтруем только сегодняшние записи
  const todayYMD = ymdLocal();
  const todayDMY = dmyLocal();

  const todayOnly = useMemo(() => {
    const arr = Array.isArray(rawNbkRates) ? rawNbkRates : [];
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
  }, [rawNbkRates, todayYMD, todayDMY]);

  // 3) Приводим к items для LineUpDownChartCard
  const nbkItems = useMemo(() => {
    return (Array.isArray(todayOnly) ? todayOnly : []).map((r: any) => ({
      code: r.currency?.code ?? "",
      value: r.rate,
      delta: Number(r.changePercent) || 0,
      label: "Курс НБ РК",
      name: r.currency?.name ?? "",
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
    await refetchNbkRates();
  }, [refetchNbkRates]);

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
      <StatusBar barStyle="dark-content" />

      {/* 🔎 Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={query}
          onChangeText={(t) => setQuery(t)}
          placeholder="Поиск: USD / Доллар"
          placeholderTextColor="#9CA3AF"
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
          isNbkRatesLoading ? (
            <View style={styles.skeletonContainer}>
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
              <Skeleton width="100%" height={60} style={styles.skeletonItem} />
            </View>
          ) : isNbkRatesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Ошибка загрузки курсов НБК</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchNbkRates()}
              >
                <Text style={styles.retryButtonText}>Повторить</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#6B7280" }}>
                Ничего не найдено по запросу “{query}”
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  searchContainer: {
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ECECEC",
    borderWidth: 1,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
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
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
