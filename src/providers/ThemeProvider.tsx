import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeType = "light" | "dark";

export const ThemeContext = createContext<{
  theme: ThemeType;
  setMode: (theme: ThemeType) => void;
}>({
  theme: "light",
  setMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme(); // "light" | "dark" | null
  const [theme, setTheme] = useState<ThemeType>(systemTheme || "light");
  const [loaded, setLoaded] = useState(false);

  // Загружаем сохранённое значение
  useEffect(() => {
    AsyncStorage.getItem("theme").then((saved) => {
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else {
        setTheme(systemTheme || "light");
      }
      setLoaded(true);
    });
  }, []);

  // Сохраняем при изменении
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem("theme", theme);
    }
  }, [theme, loaded]);

  const setMode = (t: ThemeType) => setTheme(t);

  const value = useMemo(() => ({ theme, setMode }), [theme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
