// utils/phoneUtils.ts

/** Допустимые префиксы операторов Казахстана */
export const VALID_PREFIXES = [
  "700",
  "701",
  "702",
  "703",
  "704",
  "705",
  "706",
  "707",
  "708",
  "709",
  "747",
  "771",
  "775",
  "776",
  "777",
  "778",
];

/** Проверяет, является ли номер корректным казахстанским (10 цифр без +7) */
export function isValidKazakhNumber(digits: string): boolean {
  if (!/^\d{10}$/.test(digits)) return false;
  const prefix = digits.slice(0, 3);
  return VALID_PREFIXES.includes(prefix);
}

/** Форматирует 10 цифр в маску вида +7 (XXX) XXX-XX-XX */
export function formatMaskedPhone(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 8);
  const p4 = d.slice(8, 10);
  let masked = "+7";
  if (p1) masked += ` (${p1}`;
  if (p1 && p1.length === 3) masked += ")";
  if (p2) masked += ` ${p2}`;
  if (p3) masked += `-${p3}`;
  if (p4) masked += `-${p4}`;
  return masked;
}

/** Удаляет всё лишнее и оставляет только 10 цифр */
export function extractDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 10);
}

/** Собирает телефон в формате E.164 (+7XXXXXXXXXX) */
export function toE164(digits: string): string {
  const clean = extractDigits(digits);
  return clean.length === 10 ? `+7${clean}` : "";
}
