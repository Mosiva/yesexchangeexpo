import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { Loader } from "../../../components";
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
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const currentCode = selected[0];

  // ✅ основной запрос курсов
  const {
    data: rawExchangeRatesChanges,
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

  // ✅ получаем список валют
  const { data: rawCurrencies } = useCurrenciesQuery();
  const currencies = Array.isArray(rawCurrencies) ? rawCurrencies : [];

  // ✅ выбор валюты
  const onSelectCurrency = (val: string[]) => {
    setSelected(val);
    setModalVisible(false);
    router.setParams({ id: val[0] });
  };

  // ✅ получаем самый свежий по дате элемент
  const latest = exchangeRows.length
    ? exchangeRows.reduce((a, b) => (new Date(a.ts) < new Date(b.ts) ? b : a))
    : null;

  // === Загрузка / Ошибка ===
  if (isExchangeRatesChangesLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loader />
      </View>
    );
  }

  if (isExchangeRatesChangesError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
          Не удалось загрузить данные курса. Попробуйте позже.
        </Text>
      </View>
    );
  }

  // === Основное содержимое ===
  return (
    <>
      <StatusBar barStyle="dark-content" />

      <ArchiveDetailCard
        code={currentCode}
        name={nbkRatesItem[0]?.currency?.name ?? ""}
        rows={exchangeRows}
        latest={latest}
        onPressHeader={() => setModalVisible(true)}
        onChangePeriod={(p) => setPeriod(p)}
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
