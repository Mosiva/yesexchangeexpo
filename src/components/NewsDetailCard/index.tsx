import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  title: string;
  date: string;
  content: string;
  image?: string;
  source: string;
  url: string;
};

export default function NewsDetailCard({
  title,
  date,
  content,
  image,
  source,
  url,
}: Props) {
  const router = useRouter();
  console.log(url);
  const { colors } = useTheme();

  const styles = makeStyles(colors);
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
        {/* <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable> */}
      </View>

      {/* Article */}
      <View style={styles.body}>
        <Text style={[styles.date, { color: colors.subtext }]}>{source}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.date, { color: colors.subtext }]}>
          {dayjs(date).format("DD.MM.YYYY")}
        </Text>

        <ArticleText text={content} />
        <Pressable onPress={() => Linking.openURL(url)} style={styles.button}>
          <Text style={styles.buttonText}>Источник</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/** Renders multi-paragraph text with spacing like the mock */
const ArticleText = memo(({ text }: { text: string }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
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

ArticleText.displayName = "ArticleText";

const COVER_H = 220;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    button: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    /* Cover */
    coverWrap: {
      height: COVER_H,
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.card,
    },
    cover: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    coverFallback: {
      backgroundColor: colors.card,
    },
    backBtn: {
      position: "absolute",
      left: 12,
      top: Platform.select({ ios: 50, android: 50 }),
      width: 36,
      height: 36,
      borderRadius: 10,
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
      color: colors.text,
    },
  });
