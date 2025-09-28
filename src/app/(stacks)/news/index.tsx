import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import NewsMainCardList from "../../../components/NewsMainCardList.tsx";

const ORANGE = "#F58220";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string; // "24.12.2024"
};

const TABS = ["YesNews", "Kase", "Zakon.kz"] as const;
type TabKey = (typeof TABS)[number];

const SAMPLE: Record<TabKey, NewsItem[]> = {
  YesNews: [
    {
      id: "yn1",
      title: "Информационное сообщение по валютному рынку",
      excerpt:
        "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США. Сред...",
      date: "24.12.2024",
    },
    {
      id: "yn2",
      title: "Курс тенге укрепился к доллару",
      excerpt:
        "Нацбанк сообщил об изменении коридора и повышении интереса к нотам. Доллар теряет...",
      date: "20.12.2024",
    },
    {
      id: "yn3",
      title: "Новые правила обмена валют",
      excerpt:
        "Обновлены лимиты наличных операций и требования идентификации клиентов...",
      date: "15.12.2024",
    },
  ],
  Kase: [
    {
      id: "ka1",
      title: "KASE: итоги торгов иностранной валютой",
      excerpt:
        "Объем сделок вырос, активность нерезидентов увеличилась, спред сузился...",
      date: "24.12.2024",
    },
  ],
  "Zakon.kz": [
    {
      id: "zk1",
      title: "Минфин пояснил изменения на валютном рынке",
      excerpt:
        "Ведомство ожидает стабилизации курсов и сохранения инфляции в целевом коридоре...",
      date: "24.12.2024",
    },
  ],
};

export default function NewsScreen() {
  const router = useRouter();

  const [active, setActive] = useState<TabKey>("YesNews");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const src = SAMPLE[active];
    if (!query.trim()) return src;
    const q = query.toLowerCase();
    return src.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
    );
  }, [active, query]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const focused = active === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setActive(t)}
                style={[styles.tab, focused && styles.tabActive]}
              >
                <Text style={[styles.tabText, focused && styles.tabTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          items={items.map((n) => ({
            id: n.id,
            title: n.title,
            excerpt: n.excerpt,
            date: n.date,
            onPress: () => {
              // навигация или открытие браузера
              // router.push({ pathname: "/news/[id]", params: { id: n.id } });
            },
          }))}
          initial={3}
          onMorePress={() => {}}
          onDark={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    marginBottom: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  tabsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  tabText: { color: "#6B7280", fontSize: 14, fontWeight: "400" },
  tabTextActive: { color: "#111827" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },

  // (leftover shared styles you had)
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 14,
  },
  cta: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
