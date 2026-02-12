import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NewsMainCardList from "../../../components/NewsMainCardList.tsx";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTheme } from "../../../hooks/useTheme";
import { logAnalyticsEvent } from "../../../lib/firebase";
import { useNewsQuery } from "../../../services/yesExchange";

// ---------- Tabs ----------
const TABS = ["All", "YesNews"] as const;
type TabKey = (typeof TABS)[number];

const SOURCE_MAP: Record<TabKey, string | null> = {
  YesNews: "YesNews",
  All: null,
};

export default function NewsScreen() {
  const [active, setActive] = useState<TabKey>("All");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const styles = makeStyles(colors);

  const { t } = useTranslation();

  const selectedSource = SOURCE_MAP[active];

  useEffect(() => {
    logAnalyticsEvent("view_news_screen");
  }, []);

  // ---------- QUERY PARAMS ----------
  const queryParams =
    debouncedQuery.trim().length > 0
      ? {
        limit: 100,
        search: debouncedQuery.trim(),
        searchBy: ["title"] as ("title" | "content")[],
      }
      : selectedSource
        ? {
          limit: 100,
          "filter.source": [selectedSource],
        }
        : { limit: 100 };

  // ---------- API ----------
  const {
    data: rawNews,
    refetch: refetchNews,
    isLoading: isNewsLoading,
    isError: isNewsError,
  } = useNewsQuery(queryParams);

  const news = rawNews?.data || [];

  // ---------- Tab labels ----------
  const TAB_LABELS: Record<TabKey, string> = {
    All: t("news.tabAll", "All"),
    YesNews: t("news.tabYesNews", "YesNews"),
  };

  // ---------- Convert to list items ----------
  const newsItems = useMemo(() => {
    return news.map((n) => ({
      id: n.id,
      title: n.title,
      summary: typeof n.excerpt === "string" ? n.excerpt : undefined,
      date: n.publishedAt as string,
      source: n.source,
    }));
  }, [news]);

  // ---------- Refresh ----------
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
        <ActivityIndicator size="large" color={colors.primary} />
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
            {t(
              "news.error",
              "Произошла ошибка. Потяните вниз, чтобы обновить."
            )}
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

      {/* ---------- Tabs ---------- */}
      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const focused = active === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setActive(t);
                logAnalyticsEvent("change_news_tab", { tab: t });
              }}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Text style={[styles.tabText, focused && styles.tabTextActive]}>
                {TAB_LABELS[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.trim().length > 0 && active !== "All") {
              setActive("All");
            }
          }}
          placeholder={t("news.searchByTitle", "Поиск по названию")}
          placeholderTextColor={colors.subtext}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* ---------- LIST ---------- */}
      <FlatList
        data={newsItems}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 5 }}
        renderItem={({ item }) => (
          <NewsMainCardList items={[item]} initial={1} onDark={false} />
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
      borderColor: colors.border,
      borderRadius: 14,
      height: 48,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 10,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      color: colors.text,
    },

    tabsRow: {
      flexDirection: "row",
      gap: 14,
      marginTop: 8,
      marginBottom: 12,
      marginLeft: 16,
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },

    tab: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.background,
    },

    tabActive: {
      backgroundColor: colors.tabActive,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "400",
    },

    tabTextActive: {
      color: colors.text,
      fontWeight: "600",
    },
  });
