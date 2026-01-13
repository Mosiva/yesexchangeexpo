import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar, Text, View } from "react-native";
import { Loader } from "../../../components";
import ArchiveDetailCard from "../../../components/ArchiveDetailCard";
import CurrenciesListModalArchive from "../../../components/CurrenciesListModalArchive";
import { useTheme } from "../../../hooks/useTheme";
import {
  useCurrenciesQuery,
  useExchangeRatesChangesQuery,
  useNbkRatesQuery,
} from "../../../services/yesExchange";
import { ymdLocal } from "../../../utils/nbkDateUtils";

export default function ArchiveDetailScreen() {
  const { theme, colors } = useTheme();
  const isLight = theme === "light";

  const router = useRouter();
  const { t } = useTranslation();
  const { id, branchId } = useLocalSearchParams<{
    id: string;
    branchId: string;
  }>();

  const branchIdNumber = Number(branchId);
  const initialCode = id || "USD";

  const [selected, setSelected] = useState<string[]>([initialCode]);
  const [modalVisible, setModalVisible] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [customRange, setCustomRange] = useState<{
    fromIso: string;
    toIso: string;
  } | null>(null);

  const currentCode = selected[0];

  // 📅 диапазон по умолчанию
  const getDateRange = (period: "day" | "week" | "month") => {
    const now = new Date();
    let days = 1;
    if (period === "week") days = 7;
    if (period === "month") days = 30;
    const from = new Date(now.getTime() - days * 24 * 3600 * 1000);
    return { from: ymdLocal(from), to: ymdLocal(now) };
  };

  // --- итоговый диапазон ---
  const range = customRange
    ? { from: customRange.fromIso, to: customRange.toIso }
    : getDateRange(period);

  // ✅ основной запрос курсов (Yes Exchange)
  const {
    data: rawExchangeRatesChanges,
    isLoading: isExchangeRatesChangesLoading,
    isError: isExchangeRatesChangesError,
    refetch: refetchExchangeRatesChanges,
  } = useExchangeRatesChangesQuery({
    branchId: branchIdNumber,
    from: range.from,
    to: range.to,
    currencyCodes: [currentCode],
    limit: 31,
  });

  // ✅ Автоматический refetch при изменении периода, диапазона или валюты
  useEffect(() => {
    refetchExchangeRatesChanges();
  }, [period, customRange, currentCode]);

  // ✅ обработчик при смене периода или ручного диапазона
  const handleChangePeriod = (
    p: "day" | "week" | "month",
    range?: { fromIso: string; toIso: string }
  ) => {
    setPeriod(p);
    setCustomRange(range ?? null);
  };

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
    change: { buy: Number(r.change?.buy), sell: Number(r.change?.sell) },
  }));

  const latest = exchangeRows.length
    ? exchangeRows.reduce((a, b) => (new Date(a.ts) < new Date(b.ts) ? b : a))
    : null;

  // ✅ запрос курсов НБКР
  const {
    data: rawNbkRatesItem,
    isLoading: isNbkRatesItemLoading,
    isError: isNbkRatesItemError,
  } = useNbkRatesQuery({
    from: range.from,
    to: range.to,
    currencyCode: currentCode,
  });

  const nbkRatesItem = Array.isArray(rawNbkRatesItem) ? rawNbkRatesItem : [];

  const nbkRows = Array.isArray(nbkRatesItem)
    ? nbkRatesItem.map((r: any) => {
        const [day, month, year] = r.date.split(".");
        const isoDate = `${year}-${month}-${day}T00:00:00`;
        return {
          ts: isoDate,
          rate: Number(r.rate),
          changePercent: Number(r.changePercent),
          change: r.change !== undefined ? Number(r.change) : undefined,
        };
      })
    : [];

  const latestNbkRates = nbkRows.length
    ? nbkRows.reduce((a, b) => (new Date(a.ts) < new Date(b.ts) ? b : a))
    : null;

  // ✅ список валют
  const { data: rawCurrencies } = useCurrenciesQuery();
  const currencies = Array.isArray(rawCurrencies) ? rawCurrencies : [];

  // ✅ выбор валюты
  const onSelectCurrency = (val: string[]) => {
    setSelected(val);
    setModalVisible(false);
    router.setParams({ id: val[0] });
  };

  // === Загрузка / Ошибка ===
  if (isExchangeRatesChangesLoading || isNbkRatesItemLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loader />
      </View>
    );
  }

  if (isExchangeRatesChangesError || isNbkRatesItemError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 16, color: colors.subtext, textAlign: "center" }}>
          {t(
            "archives.errorLoadingNbkRates",
            "Не удалось загрузить данные курса. Попробуйте позже."
          )}
        </Text>
      </View>
    );
  }

  // === Основное содержимое ===
  return (
    <>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      <ArchiveDetailCard
        code={currentCode}
        name={nbkRatesItem[0]?.currency?.name ?? ""}
        rows={exchangeRows}
        nbkRows={nbkRows}
        latest={latest}
        latestNbkRates={latestNbkRates}
        onPressHeader={() => setModalVisible(true)}
        onChangePeriod={handleChangePeriod}
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
