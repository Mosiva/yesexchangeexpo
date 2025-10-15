// список валют, использующих RTL-написание
const RTL_CODES = [
  "AED",
  "SAR",
  "KWD",
  "BHD",
  "OMR",
  "IQD",
  "LYD",
  "DZD",
  "SYP",
  "YER",
  "SDG",
];

export function formatCurrencyDisplay(amount: string, code: string) {
  // если арабская — всё равно выводим число слева, код справа
  const text = `${amount} ${code}`;
  return { text, isRtl: RTL_CODES.includes(code) };
}
