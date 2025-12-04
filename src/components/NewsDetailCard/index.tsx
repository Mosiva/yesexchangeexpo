import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Markdown from "react-native-markdown-display";
import RenderHTML from "react-native-render-html";
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
  const { colors } = useTheme();

  const styles = makeStyles(colors);
  return (
    <ScrollView style={styles.container} bounces>
      {/* Cover */}
      <View style={styles.coverWrap}>
        {typeof image === "string" ? (
          <Image source={{ uri: image }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]} />
        )}
      </View>

      {/* Article */}
      <View style={styles.body}>
        <Text style={[styles.date, { color: colors.subtext }]}>{source}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.date, { color: colors.subtext }]}>
          {dayjs(date).format("DD.MM.YYYY")}
        </Text>

        {/* 🔥 Условный рендер */}
        <ArticleText text={content} source={source} />

        <Pressable onPress={() => Linking.openURL(url)} style={styles.button}>
          <Text style={styles.buttonText}>Источник</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ---------- ArticleText ---------- */

const ArticleText = memo(
  ({ text, source }: { text: string; source: string }) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    // YesNews → HTML
    const isHtml = source === "YesNews";

    if (isHtml) {
      return (
        <View style={{ marginTop: 10 }}>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: text }}
            defaultTextProps={{ selectable: true }}
            tagsStyles={htmlStyles(colors)}
          />
        </View>
      );
    }

    // Остальные → Markdown
    return (
      <View style={{ marginTop: 10 }}>
        <Markdown style={markdownStyles(colors)}>{text}</Markdown>
      </View>
    );
  }
);

ArticleText.displayName = "ArticleText";

/* ---------- Styles ---------- */

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

    coverWrap: {
      height: COVER_H,
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

    body: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    title: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "800",
      marginBottom: 6,
    },
    date: {
      fontSize: 13,
      marginBottom: 8,
    },
  });

/* ---------- Markdown styles ---------- */
const markdownStyles = (colors: any) => ({
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
    color: colors.text,
  },
  paragraph: {
    marginTop: 12,
    marginBottom: 12,
  },
  link: {
    color: colors.primary,
  },
});

/* ---------- HTML styles ---------- */
const htmlStyles = (colors: any) => ({
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 14,
    marginBottom: 6,
    color: colors.text,
  },
  p: {
    marginTop: 12,
    marginBottom: 12,
  },
  a: {
    color: colors.primary,
  },
  li: {
    marginVertical: 4,
  },
});
