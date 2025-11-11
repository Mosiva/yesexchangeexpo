import { useColorScheme } from "react-native";

export function useSystemTheme() {
  const system = useColorScheme(); // "light" | "dark" | null
  return system ?? "light";
}
