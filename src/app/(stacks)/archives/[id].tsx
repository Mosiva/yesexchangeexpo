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

  // 📅 Вспомогательная функция для диапазона дат
  const getDateRange = (period: "day" | "week" | "month") => {
    const now = new Date();
    let days = 1;

    if (period === "week") days = 7;
    if (period === "month") days = 30;

    const from = new Date(now.getTime() - days * 24 * 3600 * 1000);
    return {
      from: ymdLocal(from),
      to: ymdLocal(now),
    };
  };

  // 🔁 Определяем диапазон для текущего периода
  const range = getDateRange(period);

  // ✅ основной запрос курсов (без changePeriod)
  const {
    data: rawExchangeRatesChanges,
    isLoading: isExchangeRatesChangesLoading,
    isError: isExchangeRatesChangesError,
  } = useExchangeRatesChangesQuery({
    branchId: branchIdNumber,
    from: range.from,
    to: range.to,
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

  // ✅ получаем самый свежий по дате элемент
  const latest = exchangeRows.length
    ? exchangeRows.reduce((a, b) => (new Date(a.ts) < new Date(b.ts) ? b : a))
    : null;

  const {
    data: rawNbkRatesItem,
    refetch: refetchNbkRatesItem,
    isLoading: isNbkRatesItemLoading,
    isError: isNbkRatesItemError,
  } = useNbkRatesQuery({
    from: range.from,
    to: range.to,
    currencyCode: currentCode,
  });

  const nbkRatesItem = Array.isArray(rawNbkRatesItem) ? rawNbkRatesItem : [];
  // НБКР → приводим к формату Row { ts, buy, sell }
  const nbkRows = Array.isArray(nbkRatesItem)
    ? nbkRatesItem.map((r: any) => {
        // r.date = "31.10.2025" → парсим
        const [day, month, year] = r.date.split(".");
        const isoDate = `${year}-${month}-${day}T00:00:00`;
        return {
          ts: isoDate,
          rate: Number(r.rate),
        };
      })
    : [];

  console.log("nbkRows", nbkRows);

  // ✅ получаем последний курс НБКР по дате
  const latestNbkRates = nbkRows.length
    ? nbkRows.reduce((a, b) => {
        const dateA = new Date(a.ts);
        const dateB = new Date(b.ts);
        return dateA < dateB ? b : a;
      }, nbkRows[0])
    : null;

  // ✅ получаем список валют
  const { data: rawCurrencies } = useCurrenciesQuery();
  const currencies = Array.isArray(rawCurrencies) ? rawCurrencies : [];

  // ✅ выбор валюты
  const onSelectCurrency = (val: string[]) => {
    setSelected(val);
    setModalVisible(false);
    router.setParams({ id: val[0] });
  };

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
        nbkRows={nbkRows}
        latest={latest}
        latestNbkRates={latestNbkRates}
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
