// src/types/api.ts

// --- Общие типы ---

export type CurrencyCode =
  | "AED"
  | "AMD"
  | "AUD"
  | "AZN"
  | "BGN"
  | "BHD"
  | "BRL"
  | "BYN"
  | "CAD"
  | "CHF"
  | "CNY"
  | "CZK"
  | "DKK"
  | "EUR"
  | "GBP"
  | "GEL"
  | "HKD"
  | "HUF"
  | "IDR"
  | "ILS"
  | "INR"
  | "JPY"
  | "KGS"
  | "KRW"
  | "KWD"
  | "KZT"
  | "MDL"
  | "MXN"
  | "MYR"
  | "NOK"
  | "NZD"
  | "PLN"
  | "QAR"
  | "RON"
  | "RUB"
  | "SAR"
  | "SEK"
  | "SGD"
  | "THB"
  | "TJS"
  | "TMT"
  | "TRY"
  | "UAH"
  | "USD"
  | "UZS"
  | "VND"
  | "ZAR";

export type MessageResponseDto = {
  message: string;
};

// Универсальная обёртка для пагинации
export type Paginated<T, F = unknown> = {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy?: [string, "ASC" | "DESC"][];
    searchBy?: string[];
    search?: string;
    select?: string[];
    filter?: F;
  };
  links: {
    first?: string;
    previous?: string;
    current?: string;
    next?: string;
    last?: string;
  };
};

// --- Auth DTOs ---

export type RegisterDto = {
  phone: string;
  firstName: string;
  lastName?: string;
  residentRK: boolean;
};

export type LoginDto = {
  phone: string;
};

export type VerifyOtpDto = {
  phone: string;
  code: string;
};

export type ResendOtpDto = {
  phone: string;
};

// --- User DTOs ---

export type UserDto = {
  id: number;
  phone: string;
  firstName: string;
  lastName?: string | Record<string, unknown>;
  residentRK: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateUserDto = Partial<
  Pick<UserDto, "phone" | "firstName" | "lastName" | "residentRK">
>;

// --- Branches DTOs ---

export type BranchDto = {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone: string;
};

// --- Exchange Rates DTOs ---

export type ExchangeRateDto = {
  currency: string;
  buy: number;
  sell: number;
};

export type ExchangeRateHistoryRecordDto = {
  currency: string;
  buy: number;
  sell: number;
};

// --- Nbk (Нацбанк) DTOs ---

export type NbkExchangeRateDto = {
  amount: number;
  currency: string;
  date: string; // ISO-строка
};
