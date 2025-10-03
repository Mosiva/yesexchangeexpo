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
export type Trend = "up" | "down" | "same";

// Универсальная обёртка для пагинации (оставляем как есть)
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

export type CreateUserDto = Omit<UserDto, "id" | "createdAt" | "updatedAt">;

// --- Currency DTOs (новое) ---

export type CurrencyDto = {
  code: CurrencyCode;
  name: string;
  iconUrl: string;
};

// --- Exchange Rates DTOs ---

export type DeltaDto = {
  buy: number;
  sell: number;
};

export type DeltaPercentDto = {
  buy: number;
  sell: number;
};

export type ExchangeRateDto = {
  currency: CurrencyDto;
  buy: number;
  sell: number;
  changedAt: string; // ISO datetime (поле времени в ответе)
  delta?: DeltaDto | null; // разница абсолютная
  deltaPercent?: DeltaPercentDto | null; // разница в процентах
  trend?: Trend | null; // "up" | "down" | "same"
};

export type ExchangeRateHistoryRecordDto = {
  currency: CurrencyDto;
  buy: number;
  sell: number;
  changedAt: string; // ISO datetime
  delta?: DeltaDto | null;
  deltaPercent?: DeltaPercentDto | null;
  trend?: Trend | null;
};

// --- Nbk (Нацбанк) DTOs ---

export type NbkExchangeRateDto = {
  amount: number; // номинал (1, 10, 100)
  currency: string; // код валюты строкой по спекам
  date: string; // dd.MM.yyyy
};

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

// --- Booking DTOs ---
export type BookingStatus =
  | "pending_moderation"
  | "ready_for_pickup"
  | "rejected"
  | "not_confirmed"
  | "expired";

export type BookingOperationType = "buy" | "sell";

export type CreateBookingDto = {
  branchId: number; // ID филиала
  fromCurrency: CurrencyCode; // код, напр. "KZT"
  amount: string; // decimal-string во fromCurrency
  toCurrency: CurrencyCode; // код, напр. "USD"
  operationType: BookingOperationType; // "buy" | "sell"
  isRateLocked: boolean; // фиксируем курс?
};

// в пользовательском ответе валюты — строковые коды, не объект CurrencyDto
export type BookingDto = {
  id: number;
  number: string; // ровно 8 цифр
  branch: { id: number; city: string; address: string };
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  amount: string; // decimal-string
  isRateLocked: boolean;
  toAmount: string | null; // decimal-string | null
  operationType: BookingOperationType;
  status: BookingStatus;
  expiresAt: string | null; // ISO | null
  completedAt: string | null; // ISO | null
  createdAt: string; // ISO
};
