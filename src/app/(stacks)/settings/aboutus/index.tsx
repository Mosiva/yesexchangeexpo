import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../../hooks/useTheme";

const { width } = Dimensions.get("window");
const HERO_H = Math.round((width - 32) * 0.56); // 16:9-ish, minus horizontal padding

export default function AboutUsScreen() {
  const { colors, theme } = useTheme();
  const s = makeStyles(colors);
  const isLight = theme === "light";

  // const certs = []; // при необходимости добавить изображения

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
        {/* Hero Image (опционально)
        <Image
          source={require("../../../../assets/images/about-hero.jpg")}
          style={[s.hero, { height: HERO_H }]}
          resizeMode="cover"
        /> */}

        {/* Наша история */}
        <Text style={s.h1}>Наша история</Text>
        <Text style={s.p}>
          ТОО «СЕРВИС» — один из лидеров рынка валют в Казахстане. Компания
          основана в 1997 в аэропорту г. Алматы. Компания по сей день работает
          не покладая рук и развивается в ногу со временем.
        </Text>

        {/* Наша цель */}
        <Text style={s.h1}>Наша цель</Text>
        <Text style={s.p}>
          Мы стремимся сделать процесс обмена валют максимально удобным,
          безопасным и прозрачным для каждого клиента, используя современные
          технологии и профессиональный подход.
        </Text>

        {/* Наши сертификаты */}
        <Text style={s.h1}>Наши сертификаты</Text>

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

    h1: {
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
      marginTop: 8,
      marginBottom: 10,
    },

    p: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.subtext,
      marginBottom: 18,
      fontWeight: "400",
    },

    certPlaceholder: {
      width: 200,
      height: 160,
      borderRadius: 12,
      backgroundColor: colors.card,
      marginRight: 16,
    },

    certImage: {
      width: 200,
      height: 160,
      borderRadius: 12,
      marginRight: 16,
    },
  });
