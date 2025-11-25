import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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
  } = useNewsQuery({
    limit: 100,
  });

  const news = rawNews?.data || [];

  const newsItems = React.useMemo(() => {
    return news.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.excerpt as string,
      date: n.createdAt,
    }));
  }, [news]);

  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchNews();
    setRefreshing(false);
  }, [refetchNews]);

  // ---------- Loading State ----------
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

  // ---------- Error State ----------
  if (isNewsError) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>
            Произошла ошибка. Потяните вниз, чтобы обновить.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ---------- Normal UI ----------
  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search */}
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

        {/* List */}
        <NewsMainCardList
          items={newsItems}
          initial={100}
          onMorePress={() => {}}
          onDark={false}
        />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      marginBottom: 6,
    },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ECECEC",
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 12,
      marginBottom: 10,
      backgroundColor: "#F5F6F8",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      color: "#111827",
    },
  });
