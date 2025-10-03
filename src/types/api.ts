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

export type MessageResponseDto = { message: string };

export type DeltaPeriod = "day" | "week" | "month";
export type Trend = "up" | "down" | "flat";

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
  lastName?: string | null;
  residentRK: boolean;
};

export type LoginDto = { phone: string };
export type VerifyOtpDto = { phone: string; code: string };
export type ResendOtpDto = { phone: string };

// --- User DTOs ---

export type UserDto = {
  id: number;
  phone: string;
  firstName: string;
  lastName?: string | null;
  residentRK: boolean;
  role?: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type UpdateUserDto = Partial<
  Pick<UserDto, "phone" | "firstName" | "lastName" | "residentRK" | "role">
>;

// В некоторых админ-ручках создание не требует id/дат
export type CreateUserDto = Omit<UserDto, "id" | "createdAt" | "updatedAt">;

// --- Branches DTOs ---

export type BranchDto = {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone?: string | null;
};

// --- Exchange Rates DTOs ---
// Деньги и проценты как строки: избегаем потери точности на фронте

export type ExchangeRateDto = {
  currency: CurrencyCode;
  buy: string; // decimal-string
  sell: string; // decimal-string
  updatedAt: string; // ISO datetime
  delta?: string | null; // decimal-string
  deltaPercent?: string | null; // decimal-string
  trend?: Trend | null;
};

export type ExchangeRateHistoryRecordDto = {
  currency: CurrencyCode;
  buy: string; // decimal-string
  sell: string; // decimal-string
  changedAt: string; // ISO datetime
};

// --- Nbk (Нацбанк) DTOs ---

export type NbkExchangeRateDto = {
  amount: string; // decimal-string (номинал, напр. 1, 10, 100)
  currency: CurrencyCode;
  date: string; // dd.MM.yyyy
};
