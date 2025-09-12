import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function Layout() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0A2342",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(main)"
        options={{
          tabBarLabel: t("mainpass.main"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: "QR",
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.qrTabWrapper}>
              <Ionicons name="qr-code" size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          tabBarLabel: t("mainpass.near"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="location-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    borderTopWidth: 0,
    elevation: 5,
    backgroundColor: "#fff",
  },
  qrTabWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
