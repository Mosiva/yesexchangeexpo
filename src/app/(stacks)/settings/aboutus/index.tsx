import { useFocusEffect } from "@react-navigation/native";
import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useTheme } from "../../../../hooks/useTheme";
import {
  useExchangeLicensesQuery,
  useGetAboutQuery,
} from "../../../../services/yesExchange";

const { width } = Dimensions.get("window");
const HERO_H = Math.round((width - 32) * 0.56);

export default function AboutUsScreen() {
  const { colors, theme } = useTheme();
  const s = makeStyles(colors);
  const isLight = theme === "light";

  const { data: about, isLoading, refetch } = useGetAboutQuery();
  const {
    data: exchangeLicenses,
    isLoading: isExchangeLicensesLoading,
    refetch: refetchExchangeLicenses,
  } = useExchangeLicensesQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const content = about?.content ?? "";

  const AboutText = memo(({ text }: { text: string }) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
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
  });

  AboutText.displayName = "AboutText";

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOADING */}
        {isLoading && (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        {/* Hero Image (опционально)
        <Image
          source={require("../../../../assets/images/about-hero.jpg")}
          style={[s.hero, { height: HERO_H }]}
          resizeMode="cover"
        /> */}

        {/* CONTENT */}
        {!isLoading && content !== "" && <AboutText text={content} />}

        {!isLoading && exchangeLicenses && exchangeLicenses.content !== "" && (
          <AboutText text={exchangeLicenses.content} />
        )}

        {/* Если контента нет */}
        {!isLoading && content === "" && (
          <Text style={{ color: colors.subtext, marginTop: 20 }}>
            Нет данных
          </Text>
        )}

        {/* 
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {certs.length === 0
            ? [0, 1, 2].map((i) => <View key={i} style={s.certPlaceholder} />)
            : certs.map((c, i) => (
                <Image key={i} source={c} style={s.certImage} resizeMode="cover" />
              ))}
        </ScrollView> 
        */}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: {
      width: "100%",
      borderRadius: 12,
      marginTop: 16,
      marginBottom: 20,
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
