import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "react-native";
import ArchiveDetailCard from "../../../components/ArchiveDetailCard";

export default function ArchiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // словарь валют: имя + флаг
  const meta: Record<string, { name: string; flag: string }> = {
    USD: { name: "Доллар США", flag: "🇺🇸" },
    EUR: { name: "Евро", flag: "🇪🇺" },
    RUB: { name: "Российский рубль", flag: "🇷🇺" },
    KZT: { name: "Казахстанский тенге", flag: "🇰🇿" },
  };

  // если id не в словаре → fallback
  const { name, flag } = meta[id] ?? { name: id, flag: "🏳️" };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ArchiveDetailCard
        code={id}
        name={name}
        flagEmoji={flag}
        // можно потом rows сюда подгрузить с API
      />
    </>
  );
}
