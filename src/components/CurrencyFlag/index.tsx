// components/CurrencyFlag.tsx
import React from "react";
import { StyleSheet } from "react-native";
import CountryFlag from "react-native-country-flag";
import { CurrencyCode } from "../../types/api"; // твой enum

function getFlagCode(currency: CurrencyCode): string {
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
    EUR: "EU", // особый случай
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
  };

  return map[currency];
}

type Props = {
  code: CurrencyCode;
  size?: number;
};

export default function CurrencyFlag({ code, size = 28 }: Props) {
  return (
    <CountryFlag
      isoCode={getFlagCode(code)}
      size={size}
      style={styles.flagImg}
    />
  );
}

const styles = StyleSheet.create({
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  flagImg: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  flagEmoji: { fontSize: 24, marginRight: 8 },
});
