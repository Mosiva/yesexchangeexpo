import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import NewsMainCardList from "../../../components/NewsMainCardList.tsx";
import { useTheme } from "../../../hooks/useTheme";
import { useNewsQuery } from "../../../services/yesExchange";

export default function NewsScreen() {
  const {
    data: rawNews,
    refetch: refetchNews,
    isLoading: isNewsLoading,
    isError: isNewsError,
  } = useNewsQuery({ limit: 100 });

  const news = rawNews?.data || [];

  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // фильтрация новостей по названию
  const filteredNews = useMemo(() => {
    if (!query.trim()) return news;
    const q = query.toLowerCase();
    return news.filter((item) => item.title.toLowerCase().includes(q));
  }, [query, news]);

  // FlatList-совместимый массив
  const newsItems = useMemo(() => {
    return filteredNews.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.excerpt as string,
      date: n.createdAt,
    }));
  }, [filteredNews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchNews();
    setRefreshing(false);
  }, [refetchNews]);

  // ---------- LOADING ----------
  if (isNewsLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // ---------- ERROR ----------
  if (isNewsError) {
    return (
      <FlatList
        data={[]}
        contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ color: colors.text, fontSize: 16 }}>
            Произошла ошибка. Потяните вниз, чтобы обновить.
          </Text>
        }
        renderItem={null}
      />
    );
  }

  // ---------- NORMAL UI ----------
  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      <FlatList
        data={newsItems}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            {/* SEARCH */}
            <View style={styles.searchWrap}>
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск по названию"
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <NewsMainCardList
            items={[item]}
            initial={1}
            onMorePress={() => {}}
            onDark={false}
          />
        )}
      />
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ECECEC",
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 12,
      marginBottom: 16,
      backgroundColor: "#F5F6F8",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      color: "#111827",
    },
  });
