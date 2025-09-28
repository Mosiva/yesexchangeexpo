import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { memo } from "react";
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Params = {
  title?: string;
  date?: string; // e.g. "24.12.2024"
  content?: string; // full text with \n\n for paragraphs
  image?: string; // http(s) url
};

export default function NewsDetail() {
  const { title, date, content, image } = useLocalSearchParams<Params>();
  const router = useRouter();

  const safeTitle = title || "Информационное сообщение\nпо валютному рынку";
  const safeDate = date || "24.12.2024";
  const safeContent =
    content ||
    [
      "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США. Среднедневной объём торгов на Казахстанской фондовой бирже за месяц увеличился с 132 до 141 млн долл. США.",
      "Продажи валютной выручки субъектами квазигосударственного сектора в течение прошедшего месяца составили порядка 328,7 млн долл. США. Компании квазигосударственного сектора самостоятельно осуществляют продажу на валютном рынке через банки второго уровня.",
      "Продажи валютной выручки субъектами квазигосударственного сектора в течение прошедшего месяца составили порядка 328,7 млн долл. США. Компании квазигосударственного сектора самостоятельно осуществляют продажу на валютном рынке через банки второго уровня.",
    ].join("\n\n");

  return (
    <ScrollView style={styles.container} bounces>
      {/* Cover image / placeholder */}
      <View style={styles.coverWrap}>
        {typeof image === "string" ? (
          <Image source={{ uri: image }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]} />
        )}

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
      </View>

      {/* Article */}
      <View style={styles.body}>
        <Text style={styles.title}>{safeTitle}</Text>
        <Text style={styles.date}>{safeDate}</Text>

        <ArticleText text={safeContent} />
      </View>
    </ScrollView>
  );
}

/** Renders multi-paragraph text with spacing like the mock */
const ArticleText = memo(({ text }: { text: string }) => {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <View style={{ marginTop: 10 }}>
      {paragraphs.map((p, idx) => (
        <Text key={idx} style={[styles.p, idx > 0 && { marginTop: 14 }]}>
          {p}
        </Text>
      ))}
    </View>
  );
});

ArticleText.displayName = 'ArticleText';

const COVER_H = 220;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },

  /* Cover */
  coverWrap: {
    height: COVER_H,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  cover: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverFallback: {
    backgroundColor: "#E5E7EB",
  },
  backBtn: {
    position: "absolute",
    left: 12,
    top: Platform.select({ ios: 12, android: 12 }),
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Content */
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
});
