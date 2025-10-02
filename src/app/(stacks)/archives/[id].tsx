import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "react-native";
import ArchiveDetailCard from "../../../components/ArchiveDetailCard";
import CurrenciesListModalArchive from "../../../components/CurrenciesListModalArchive";

const META: Record<string, { name: string; flag: string }> = {
  USD: { name: "Доллар США", flag: "🇺🇸" },
  EUR: { name: "Евро", flag: "🇪🇺" },
  RUB: { name: "Российский рубль", flag: "🇷🇺" },
  KZT: { name: "Казахстанский тенге", flag: "🇰🇿" },
};

export default function ArchiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const initCode = id || "USD";
  const [selected, setSelected] = useState([initCode]);
  const [modalVisible, setModalVisible] = useState(false);

  const { name, flag } = META[selected[0]] ?? {
    name: selected[0],
    flag: "🏳️",
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ArchiveDetailCard
        code={selected[0]}
        name={name}
        flagEmoji={flag}
        onPressHeader={() => setModalVisible(true)}
      />

      <CurrenciesListModalArchive
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        value={selected}
        onConfirm={(val) => {
          setSelected(val);
          setModalVisible(false);
        }}
      />
    </>
  );
}
