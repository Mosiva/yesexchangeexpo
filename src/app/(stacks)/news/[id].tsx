import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import NewsDetailCard from "../../../components/NewsDetailCard";
import { useTheme } from "../../../hooks/useTheme";
import { useNewsByIdQuery } from "../../../services/yesExchange";

type Params = {
  id: string;
};

export default function NewsDetail() {
  const { id } = useLocalSearchParams<Params>();
  const numericId = Number(id);

  const {
    data: newsItem,
    isLoading: isNewsLoading,
    isError: isNewsError,
    refetch,
  } = useNewsByIdQuery({ id: numericId }, { skip: !numericId });

  console.log("id:", id);
  console.log("numericId:", numericId);

  const { theme, colors } = useTheme();
  const isLight = theme === "light";

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ---------- Loading ----------
  if (isNewsLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ---------- Error ----------
  if (isNewsError) {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingTop: 100,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 16 }}>
          Произошла ошибка. Потяните вниз, чтобы обновить.
        </Text>
      </ScrollView>
    );
  }

  // ---------- No Data ----------
  if (!newsItem) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16 }}>Новость не найдена.</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />
      <NewsDetailCard
        title={newsItem.title as string}
        date={newsItem.publishedAt as string}
        content={newsItem.content as string}
        image={newsItem.imageUrl as string}
        source={newsItem.source as string}
        url={newsItem.url as string}
      />
    </>
  );
}
