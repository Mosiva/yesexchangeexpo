import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "react-native";
import ArchiveDetailCard from "../../../components/ArchiveDetailCard";
import CurrenciesListModalArchive from "../../../components/CurrenciesListModalArchive";
import {
  useCurrenciesQuery,
  useExchangeRatesChangesQuery,
  useNbkRatesQuery,
} from "../../../services/yesExchange";
import { ymdLocal } from "../../../utils/nbkDateUtils";

export default function ArchiveDetailScreen() {
  const router = useRouter();
  const { id, branchId } = useLocalSearchParams<{
    id: string;
    branchId: string;
  }>();

  const branchIdNumber = Number(branchId);

  const initialCode = id || "USD";

  const [selected, setSelected] = useState<string[]>([initialCode]);
  const [modalVisible, setModalVisible] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day"); // ✅ добавлено

  const currentCode = selected[0];

  const {
    data: rawExchangeRatesChanges,
    refetch: refetchExchangeRatesChanges,
    isLoading: isExchangeRatesChangesLoading,
    isError: isExchangeRatesChangesError,
  } = useExchangeRatesChangesQuery({
    branchId: branchIdNumber,
    changePeriod: period,
    currencyCodes: [currentCode],
  });

  const rawList = Array.isArray(rawExchangeRatesChanges)
    ? rawExchangeRatesChanges
    : Array.isArray(rawExchangeRatesChanges?.data)
    ? rawExchangeRatesChanges.data
    : [];

  const exchangeRows = rawList.map((r) => ({
    ts: new Date(r.changedAt).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    buy: Number(r.buy),
    sell: Number(r.sell),
  }));

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

  // Получаем последний по времени элемент
  const latest = exchangeRows.length
    ? exchangeRows.reduce((a, b) => (new Date(a.ts) > new Date(b.ts) ? a : b))
    : null;

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <ArchiveDetailCard
        code={currentCode}
        name={nbkRatesItem[0]?.currency?.name ?? ""}
        rows={exchangeRows} // ✅ передаем реальные данные
        onPressHeader={() => setModalVisible(true)}
        latest={latest} // ✅ передаем последний (актуальный)
        onChangePeriod={(p) => setPeriod(p)} // ✅ слушаем из графика
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
