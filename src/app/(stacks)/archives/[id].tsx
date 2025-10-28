import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "react-native";
import ArchiveDetailCard from "../../../components/ArchiveDetailCard";
import CurrenciesListModalArchive from "../../../components/CurrenciesListModalArchive";
import {
  useCurrenciesQuery,
  useNbkRatesQuery,
} from "../../../services/yesExchange";
import { ymdLocal } from "../../../utils/nbkDateUtils";

export default function ArchiveDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const initialCode = id || "USD";

  const [selected, setSelected] = useState<string[]>([initialCode]);
  const [modalVisible, setModalVisible] = useState(false);

  const currentCode = selected[0];

  // ✅ Запрос теперь по выбранной валюте
  const {
    data: rawNbkRatesItem,
    refetch: refetchNbkRatesItem,
    isLoading: isNbkRatesItemLoading,
    isError: isNbkRatesItemError,
  } = useNbkRatesQuery({
    from: ymdLocal(new Date(Date.now() - 24 * 3600 * 1000)),
    to: ymdLocal(new Date()),
    currencyCode: currentCode,
  });

  const nbkRatesItem = Array.isArray(rawNbkRatesItem) ? rawNbkRatesItem : [];

  const { data: rawCurrencies } = useCurrenciesQuery();

  const currencies = Array.isArray(rawCurrencies) ? rawCurrencies : [];

  const onSelectCurrency = (val: string[]) => {
    setSelected(val);
    setModalVisible(false);
    router.setParams({ id: val[0] });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <ArchiveDetailCard
        code={currentCode}
        name={nbkRatesItem[0]?.currency?.name ?? ""}
        onPressHeader={() => setModalVisible(true)}
      />

      <CurrenciesListModalArchive
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        value={selected}
        items={currencies}
        onConfirm={onSelectCurrency}
      />
    </>
  );
}
