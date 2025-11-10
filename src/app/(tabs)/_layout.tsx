import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ORANGE = "#F58220";
const INACTIVE = "#8E8E93";
const BAR_BG = "#fff";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel ?? options.title ?? (route.name as string);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? ORANGE : INACTIVE;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
            style={styles.tabItem}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            {/* per-cell indicator → perfectly aligned */}
            <View
              pointerEvents="none"
              style={[styles.cellIndicator, { opacity: isFocused ? 1 : 0 }]}
            />
            {typeof options.tabBarIcon === "function"
              ? options.tabBarIcon({ color, focused: isFocused, size: 26 })
              : null}
            <Text style={[styles.label, { color }]}>{label as string}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="(main)"
        options={{
          tabBarLabel: t("mainpass.main", "Главная"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          tabBarLabel: "Карта",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reserve"
        options={{
          tabBarLabel: t("reserve.title", "Бронь"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmarks" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Профиль",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: BAR_BG,
    height: Platform.select({
      ios: 88,
      android: 99,
      default: 90,
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10, // space below the indicator
    gap: 4,
  },
  cellIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0, // <-- stretches exactly to the tab cell width
    height: 4,
    backgroundColor: ORANGE,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
