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
  | "EGP"
  | "EUR"
  | "GBP"
  | "GEL"
  | "HKD"
  | "HUF"
  | "IDR"
  | "ILS"
  | "INR"
  | "IRR"
  | "JPY"
  | "KGS"
  | "KHR"
  | "KRW"
  | "KWD"
  | "KZT"
  | "LKR"
  | "MDL"
  | "MNT"
  | "MVR"
  | "MXN"
  | "MYR"
  | "NOK"
  | "NZD"
  | "OMR"
  | "PKR"
  | "PLN"
  | "QAR"
  | "RON"
  | "RUB"
  | "SAR"
  | "SCR"
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

// В спеках используется ChangePeriodEnum
export type ChangePeriod = "day" | "week" | "month";
// Сохранён алиас для обратной совместимости
export type DeltaPeriod = ChangePeriod;

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

// --- Auth DTOs (по openapi) ---

export type RegisterDto = {
  phone: string;
  firstName: string;
  lastName?: string | null;
  residentRK: boolean;
};
export type LoginDto = { phone: string };
export type VerifyOtpDto = { phone: string; code: string };
export type ResendOtpDto = { phone: string };

export type OtpRequestResultDto = {
  ttl: number;
  resendAt: number;
};
export type VerifyOtpResponseDto = {
  accessToken: string;
  refreshToken: string;
};
export type RefreshTokenResponseDto = {
  accessToken: string;
  refreshToken: string;
};
export type LogoutResponseDto = { ok: boolean };

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
  defaultCurrency?: CurrencyDto; // из спеки поле присутствует
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type UpdateUserDto = Partial<
  Pick<UserDto, "phone" | "firstName" | "lastName" | "residentRK" | "role">
>;

// --- Currency DTOs ---

export type CurrencyDto = {
  code: string; // по спекам строка
  name: string;
  iconUrl: string;
};

// --- Branches DTOs ---

export type BranchDto = {
  id: number;
  externalId: number | null;
  city: string;
  address: string;
  lat: number;
  lng: number;
  email: string;
  contactPhone: string;
  twoGisLink: string;
  photos: string[];
  schedule: string[];
};

// Упрощённый филиал для BookingDto
export type BranchDtoWithIdCityAndAddress = {
  id: number;
  city: string;
  address: string;
};

// --- Exchange Rates DTOs ---

export type ChangeDto = { buy: number; sell: number };
export type ChangePercentDto = { buy: number; sell: number };
export type TrendDto = { buy: Trend; sell: Trend };

export type ExchangeRateDto = {
  id: number;
  currency: CurrencyDto;
  buy: number;
  sell: number;
  changedAt: string; // ISO datetime
  change?: ChangeDto;
  changePercent?: ChangePercentDto;
  trend?: TrendDto;
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
  change?: ChangeDto;
  changePercent?: ChangePercentDto;
  trend?: TrendDto;
};

// --- НБК (Нацбанк) DTOs ---

export type NbkRateDto = {
  currency: CurrencyDto;
  rate: number;
  quantity: number;
  change?: number;
  changePercent?: number;
  trend?: Trend;
  date: string; // dd.MM.yyyy
};

// --- Booking DTOs ---

export type BookingStatus =
  | "created"
  | "pending_moderation"
  | "not_confirmed"
  | "ready_for_pickup"
  | "cancelled"
  | "expired"
  | "received"
  | "sync_failed"
  | "external_deleted";

export type BookingOperationType = "buy" | "sell";

export type CreateBookingDto = {
  branchId: number;
  exchangeRateId: number;
  amount: string; // decimal-string
  operationType: BookingOperationType;
  isRateLocked: boolean;
};

export type CreateGuestBookingDto = CreateBookingDto & {
  otpCode?: string; // опционально
};

export type ToAmountQueryDto = {
  branchId: number;
  exchangeRateId: number;
  amount: string; // decimal-string
  operationType: BookingOperationType;
};

export type ToAmountResponseDto = {
  toAmount: string; // decimal-string
  rate: string; // decimal-string
};

export type BookingDto = {
  id: number;
  number: string; // ровно 8 цифр
  branch: BranchDtoWithIdCityAndAddress;
  fromExchangeRate: ExchangeRateDtoWithIdCurrencySellAndBuy;
  toExchangeRate: ExchangeRateDtoWithIdCurrencySellAndBuy;
  amount: string;
  isRateLocked: boolean;
  toAmount: string | null;
  operationType: BookingOperationType;
  status: BookingStatus;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type CancelBookingResponseDto = { message: string };

// --- Contact Forms DTOs ---

export type CreateJobApplicationDto = {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
};

export type CreateFeedbackDto = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactFormResponseDto = {
  success: boolean;
  message: string;
  id: number;
};

// --- News DTOs ---

export type NewsSource = "YesNews" | "KASE" | "Zakon.kz";

export type NewsDto = {
  id: number;
  title: string;
  content?: unknown;
  excerpt?: unknown;
  imageUrl?: unknown;
  source: NewsSource;
  url: string;
  publishedAt?: unknown;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// --- Bitrix DTOs (на будущее, если понадобятся) ---

export type BitrixWebhookDto = {
  event: string;
  data: Record<string, unknown>;
  auth: Record<string, unknown>;
};
export type BitrixEventDto = BitrixWebhookDto & {
  event_handler_id: string;
  ts: string;
};
export type BitrixResponseDto = {
  success: boolean;
  jobId: string;
};
