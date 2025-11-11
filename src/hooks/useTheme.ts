import { useContext } from "react";
import { ThemeContext } from "../providers/ThemeProvider";
import { DarkColors, LightColors } from "../theme/color";

export const useTheme = () => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === "dark" ? DarkColors : LightColors;
  return { theme, colors };
};
