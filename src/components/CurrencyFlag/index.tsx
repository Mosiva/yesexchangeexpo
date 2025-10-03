// components/CurrencyFlag.tsx
import React from "react";
import { StyleSheet, Text } from "react-native";
import CountryFlag from "react-native-country-flag";
import { CurrencyCode } from "../../types/api";

function getFlagCode(currency: CurrencyCode): string | null {
  const map: Record<CurrencyCode, string> = {
    AED: "AE",
    AMD: "AM",
    AUD: "AU",
    AZN: "AZ",
    BGN: "BG",
    BHD: "BH",
    BRL: "BR",
    BYN: "BY",
    CAD: "CA",
    CHF: "CH",
    CNY: "CN",
    CZK: "CZ",
    DKK: "DK",
    GBP: "GB",
    GEL: "GE",
    HKD: "HK",
    HUF: "HU",
    IDR: "ID",
    ILS: "IL",
    INR: "IN",
    JPY: "JP",
    KGS: "KG",
    KRW: "KR",
    KWD: "KW",
    KZT: "KZ",
    MDL: "MD",
    MXN: "MX",
    MYR: "MY",
    NOK: "NO",
    NZD: "NZ",
    PLN: "PL",
    QAR: "QA",
    RON: "RO",
    RUB: "RU",
    SAR: "SA",
    SEK: "SE",
    SGD: "SG",
    THB: "TH",
    TJS: "TJ",
    TMT: "TM",
    TRY: "TR",
    UAH: "UA",
    USD: "US",
    UZS: "UZ",
    VND: "VN",
    ZAR: "ZA",
    EUR: "EU", // 👈 обработаем вручную
  };
  return map[currency] ?? null;
}

type Props = {
  code: CurrencyCode;
  size?: number;
};

export default function CurrencyFlag({ code, size = 28 }: Props) {
  const iso = getFlagCode(code);
  if (!iso) {
    return <Text style={{ fontSize: size }}>🏳️</Text>; // fallback
  }

  return <CountryFlag isoCode={iso} size={size} style={styles.flagImg} />;
}

const styles = StyleSheet.create({
  flagImg: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
});
