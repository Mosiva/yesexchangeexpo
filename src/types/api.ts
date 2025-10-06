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

export type UserRole = "admin" | "user";

export type UserDto = {
  id: number;
  phone: string;
  firstName: string;
  lastName?: string | null;
  residentRK: boolean;
  phoneVerified: boolean;
  blocked: boolean;
  role: UserRole;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type UpdateUserDto = Partial<
  Pick<UserDto, "phone" | "firstName" | "lastName" | "residentRK" | "role">
>;

export type CreateUserDto = {
  phone: string;
  firstName: string;
  lastName?: string | null;
  residentRK: boolean;
  role: UserRole;
};

// --- Предпочтения пользователя ---

export type SetFavoriteCurrenciesDto = {
  currencyCodes: string[]; // ISO-4217
};

// --- Currency DTOs ---

export type CurrencyDto = {
  code: CurrencyCode;
  name: string;
  iconUrl: string;
};

// --- Branches DTOs ---

export type BranchDto = {
  id: number;
  city: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone: string;
};

// --- Exchange Rates DTOs ---

export type DeltaDto = { buy: number; sell: number };
export type DeltaPercentDto = { buy: number; sell: number };

export type ExchangeRateDto = {
  id: number;
  currency: CurrencyDto;
  buy: number;
  sell: number;
  changedAt: string; // ISO datetime
  delta?: DeltaDto | null;
  deltaPercent?: DeltaPercentDto | null;
  trend?: Trend | null;
};

export type ExchangeRateDtoWithIdCurrencySellAndBuy = {
  id: number;
  currency: CurrencyDto;
  buy: number;
  sell: number;
};

export type ExchangeRateHistoryRecordDto = {
  id: number;
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
  amount: number;
  currencyCode: string; // ISO-4217
  date: string; // dd.MM.yyyy
};

// --- Booking DTOs ---

export type BookingStatus =
  | "pending_moderation"
  | "not_confirmed"
  | "ready_for_pickup"
  | "cancelled"
  | "expired"
  | "received";

export type BookingOperationType = "buy" | "sell";

export type CreateBookingDto = {
  branchId: number;
  fromExchangeRateId: number;
  amount: string; // decimal-string
  toExchangeRateId: number;
  operationType: BookingOperationType;
  isRateLocked: boolean;
};

export type ToAmountQueryDto = {
  fromExchangeRateId: number;
  fromAmount: string; // decimal-string
  toExchangeRateId: number;
};

export type ToAmountResponseDto = {
  toAmount: string; // decimal-string
  rate: string; // decimal-string
};

export type BookingDto = {
  id: number;
  number: string; // ровно 8 цифр
  branch: { id: number; city: string; address: string };
  fromExchangeRate: ExchangeRateDtoWithIdCurrencySellAndBuy;
  toExchangeRate: ExchangeRateDto;
  amount: string;
  isRateLocked: boolean;
  toAmount: string | null;
  operationType: BookingOperationType;
  status: BookingStatus;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

// --- Admin Bookings DTOs ---

export type AdminBookingDto = BookingDto & {
  // расширенная версия с полным BranchDto и UserDto
  branch: BranchDto;
  user: UserDto | null;
  discountPercentApplied: string | null;
  lockedRate: string | null;
  lockedAt: string | null;
  phone: string | null;
  canceledAt: string | null;
  canceledBy: string | null;
};

export type UpdateBookingStatusDto = {
  status: BookingStatus;
  canceledBy?: "admin" | "automatic" | "external" | "user";
};

// --- Violations DTOs ---

export type ViolationSeverity = "none" | "low" | "medium" | "high" | "critical";

export type ViolationTypeDto = {
  code: string;
  title: string;
  description?: string;
  severity: ViolationSeverity;
  retiredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateViolationTypeDto = {
  code: string;
  title: string;
  description?: string;
  severity?: ViolationSeverity; // default: none
};

export type UpdateViolationTypeDto = Partial<
  Pick<ViolationTypeDto, "title" | "description" | "severity" | "retiredAt">
>;

export type UserViolationDto = {
  userId?: number | null;
  phone: string;
  violationTypeCode: string;
  description?: string | Record<string, unknown> | null;
};

export type CreateUserViolationDto = {
  userId?: number | null;
  phone: string;
  violationTypeCode: string;
  description?: string | Record<string, unknown> | null;
};
