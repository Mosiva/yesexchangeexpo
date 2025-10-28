import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
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

// === Helpers ===
const getYesterdayDate = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split("T")[0];
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function ArchivesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const {
    data: rawNbkRates,
    refetch: refetchNbkRates,
    isLoading: isNbkRatesLoading,
    isError: isNbkRatesError,
  } = useNbkRatesQuery({
    from: getYesterdayDate(),
    to: getTodayDate(),
    limit: 30,
  });

  const nbkItems = React.useMemo(() => {
    return (Array.isArray(rawNbkRates) ? rawNbkRates : []).map((r: any) => ({
      code: r.currency?.code ?? "",
      value: r.rate,
      delta: Number(r.changePercent) || 0,
      label: "Курс НБ РК",
    }));
  }, [rawNbkRates]);

  const filteredItems = React.useMemo(() => {
    if (!query) return nbkItems;
    return nbkItems.filter((i) =>
      i.code.toUpperCase().includes(query.toUpperCase())
    );
  }, [query, nbkItems]);

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
          onChangeText={(t) => setQuery(t.replace(/\s/g, "").toUpperCase())}
          placeholder="Поиск по коду валюты"
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
          <LineUpDownChartCard items={[item]} initial={1} />
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

// === Styles ===
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
