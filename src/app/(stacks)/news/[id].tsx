import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "react-native";
import NewsDetailCard from "../../../components/NewsDetailCard";
import { useTheme } from "../../../hooks/useTheme";

type Params = {
  title?: string;
  date?: string; // e.g. "24.12.2024"
  content?: string;
  image?: string;
};

export default function NewsDetail() {
  const { title, date, content, image } = useLocalSearchParams<Params>();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const safeTitle = title || "Информационное сообщение\nпо валютному рынку";
  const safeDate = date || "24.12.2024";
  const safeContent =
    content ||
    [
      "По итогам декабря курс тенге укрепился на 1,3% до 462,66 тенге за доллар США. Среднедневной объём торгов на Казахстанской фондовой бирже за месяц увеличился с 132 до 141 млн долл. США.",
      "Продажи валютной выручки субъектами квазигосударственного сектора в течение прошедшего месяца составили порядка 328,7 млн долл. США.",
    ].join("\n\n");

  return (
    <>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />
      <NewsDetailCard
        title={safeTitle}
        date={safeDate}
        content={safeContent}
        image={image}
      />
    </>
  );
}
