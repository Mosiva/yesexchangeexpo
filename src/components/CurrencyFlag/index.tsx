// components/CurrencyFlag.tsx
import React from "react";
import { StyleSheet, Text } from "react-native";
import CountryFlag from "react-native-country-flag";
import { CurrencyCode } from "../../types/api";

function getFlagCode(currency: CurrencyCode): string | null {
  const map: Record<CurrencyCode, string> = {
    AED: "AE", // Дирхам ОАЭ
    AMD: "AM", // Армянский драм
    AUD: "AU", // Австралийский доллар
    AZN: "AZ", // Азербайджанский манат
    BGN: "BG", // Болгарский лев
    BHD: "BH", // Бахрейнский динар
    BRL: "BR", // Бразильский реал
    BYN: "BY", // Белорусский рубль
    CAD: "CA", // Канадский доллар
    CHF: "CH", // Швейцарский франк
    CNY: "CN", // Китайский юань
    CZK: "CZ", // Чешская крона
    DKK: "DK", // Датская крона
    EGP: "EG", // Египетский фунт 🆕
    EUR: "EU", // Евро (общеевропейский флаг)
    GBP: "GB", // Фунт стерлингов
    GEL: "GE", // Грузинский лари
    HKD: "HK", // Гонконгский доллар
    HUF: "HU", // Венгерский форинт
    IDR: "ID", // Индонезийская рупия
    ILS: "IL", // Израильский шекель
    INR: "IN", // Индийская рупия
    IRR: "IR", // Иранский риал 🆕
    JPY: "JP", // Японская иена
    KGS: "KG", // Киргизский сом
    KHR: "KH", // Камбоджийский риель 🆕
    KRW: "KR", // Южнокорейская вона
    KWD: "KW", // Кувейтский динар
    KZT: "KZ", // Казахстанский тенге
    LKR: "LK", // Шри-ланкийская рупия 🆕
    MDL: "MD", // Молдавский лей
    MNT: "MN", // Монгольский тугрик 🆕
    MVR: "MV", // Мальдивская руфия 🆕
    MXN: "MX", // Мексиканское песо
    MYR: "MY", // Малайзийский ринггит
    NOK: "NO", // Норвежская крона
    NZD: "NZ", // Новозеландский доллар
    OMR: "OM", // Оманский риал 🆕
    PKR: "PK", // Пакистанская рупия 🆕
    PLN: "PL", // Польский злотый
    QAR: "QA", // Катарский риал
    RON: "RO", // Румынский лей
    RUB: "RU", // Российский рубль
    SAR: "SA", // Саудовский риал
    SCR: "SC", // Сейшельская рупия 🆕
    SEK: "SE", // Шведская крона
    SGD: "SG", // Сингапурский доллар
    THB: "TH", // Тайский бат
    TJS: "TJ", // Таджикский сомони
    TMT: "TM", // Туркменский манат
    TRY: "TR", // Турецкая лира
    UAH: "UA", // Украинская гривна
    USD: "US", // Доллар США
    UZS: "UZ", // Узбекский сум
    VND: "VN", // Вьетнамский донг
    ZAR: "ZA", // Южноафриканский ранд
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
