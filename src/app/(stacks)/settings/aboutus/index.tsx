import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const HERO_H = Math.round((width - 32) * 0.56); // 16:9-ish, minus horizontal padding

export default function AboutUsScreen() {
  // If you have real images, replace the require(...) or add URIs in the array below.
  // const certs = [
  //   // { uri: "https://example.com/cert1.jpg" },
  //   // { uri: "https://example.com/cert2.jpg" },
  //   // { uri: "https://example.com/cert3.jpg" },
  // ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        {/* <Image
          source={require("../../../../assets/images/about-hero.jpg")} // put your team/hero image here
          style={[styles.hero, { height: HERO_H }]}
          resizeMode="cover"
        /> */}

        {/* Наша история */}
        <Text style={styles.h1}>Наша история</Text>
        <Text style={styles.p}>
          ТОО «СЕРВИС» — один из лидеров рынка валют в Казахстане. Компания
          основана в 1997 в аэропорту г.Алматы. Компания по сей день работает не
          покладая рук и развивается в ногу со временем.
        </Text>

        {/* Наша цель */}
        <Text style={styles.h1}>Наша цель</Text>
        <Text style={styles.p}>
          ТОО «СЕРВИС» — один из лидеров рынка валют в Казахстане. Компания
          основана в 1997 в аэропорту г.Алматы. Компания по сей день работает не
          покладая рук и развивается в ногу со временем.
        </Text>

        {/* Наши сертификаты */}
        <Text style={styles.h1}>Наши сертификаты</Text>
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {certs.length === 0
            ? [0, 1, 2].map((i) => (
                <View key={i} style={styles.certPlaceholder} />
              ))
            : certs.map((c, i) => (
                <Image
                  key={i}
                  source={c}
                  style={styles.certImage}
                  resizeMode="cover"
                />
              ))}
        </ScrollView> */}
      </ScrollView>
    </View>
  );
}

const COLORS = {
  text: "#111827",
  subtext: "#4B5563",
  card: "#E5E7EB",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  hero: {
    width: "100%",
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
  },

  h1: {
    fontSize: 18,
    fontWeight: "400",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 10,
  },

  p: {
    fontSize: 18,
    color: COLORS.subtext,
    marginBottom: 18,
    fontWeight: "400",
  },

  certPlaceholder: {
    width: 200,
    height: 160,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginRight: 16,
  },

  certImage: {
    width: 200,
    height: 160,
    borderRadius: 12,
    marginRight: 16,
  },
});
