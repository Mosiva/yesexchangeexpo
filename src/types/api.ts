// --- Общие типы ---

// --- Static/HTML Page DTOs ---
export type ExchangeLicensesPageDto = {
  id: number;
  title: string; // заголовок страницы
  content: string; // HTML
};

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

// В openapi используется ChangePeriodEnum
export type ChangePeriod = "day" | "week" | "month";
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

// --- Health DTOs ---

export type ComponentStatusDto = {
  status: "up" | "down";
  message?: string;
};

export type HealthCheckDetailsDto = {
  database: ComponentStatusDto;
  redis: ComponentStatusDto;
  memory_heap: ComponentStatusDto;
  storage: ComponentStatusDto;
};

export type HealthCheckResponseDto = {
  status: "ok" | "error";
  info: HealthCheckDetailsDto;
  error: HealthCheckDetailsDto;
  details: HealthCheckDetailsDto;
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
  defaultCurrency?: CurrencyDto;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  discount?: UserDiscountDto;
};

export type UpdateUserDto = Partial<
  Pick<UserDto, "phone" | "firstName" | "lastName" | "residentRK" | "role">
>;

// --- Currency DTOs ---

export type CurrencyDto = {
  code: string; // в openapi — string
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
// --- User Preferences: Preferred Branch ---
export type SetPreferredBranchDto = {
  branchId: number; // ID филиала
};

export type SetPreferredBranchResponseDto = {
  message: string;
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

// --- НБК (история) DTOs ---
export type NbkHistoryPointDto = {
  date: string;          // dd.MM.yyyy
  rate: number;          // курс в тенге
  change?: number;       // абсолютное изменение vs предыдущий день
  changePercent?: number;// % изменение vs предыдущий день
  trend?: Trend;         // 'up' | 'down' | 'same'
};

export type NbkHistoryResponseDto = {
  currency: CurrencyDto;       // информация о валюте
  change: number;              // изменение за последний день
  changePercent: number;       // % изменение за последний день
  trend: Trend;                // общий тренд
  history: NbkHistoryPointDto[]; // точки истории (новые первыми)
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
  otpCode?: string;
};

export type ToAmountQueryDto = {
  branchId: number;
  exchangeRateId: number;
  amount: string; // decimal-string
  operationType: BookingOperationType;
  isRateLocked: boolean;
};

export type ToAmountResponseDto = {
  toAmount: string; // decimal-string
  rate: string; // decimal-string (эффективный)
  originalRate?: string; // decimal-string (без скидки)
  operationType: BookingOperationType;
  discountPercent?: number | null; // null если не применена
  savings?: string | null; // decimal-string | null
};

export type AboutDto = {
  id: number;
  title: string;
  content: string; // HTML
};

// --- User Notification Settings DTOs (новое) ---
export type NotificationSettingsDto = {
  exchangeRatesEnabled: boolean; // изменения курсов избранных валют
  financialNewsEnabled: boolean; // KASE, Zakon
  yesxNewsEnabled: boolean; // новости YesExchange
};

export type UpdateNotificationSettingsDto = Partial<NotificationSettingsDto>;

export type BookingDto = {
  id: number;
  number: string; // ровно 8 цифр
  branch: BranchDtoWithIdCityAndAddress;
  fromExchangeRate: ExchangeRateDtoWithIdCurrencySellAndBuy;
  toExchangeRate: ExchangeRateDtoWithIdCurrencySellAndBuy;
  amount: string;
  isRateLocked: boolean;
  toAmount: string | null;
  lockedRate: number | null;
  discountPercentApplied: number | null;
  operationType: BookingOperationType;
  status: BookingStatus;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type CancelBookingResponseDto = { message: string };

// --- Guest OTP DTOs ---

export type VerifyGuestOtpDto = {
  phone: string;
  otpCode: string;
};

export type GuestBookingTokenResponseDto = {
  accessToken: string;
  expiresIn: number;
  phone: string;
};

// --- Contact Forms DTOs ---

export type CreateJobApplicationDto = {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resume?: File;
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

// --- Bitrix DTOs ---

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

// --- Push Notifications DTOs ---

export type RegisterDeviceTokenDto = {
  pushToken: string;
  tokenType?: "fcm" | "expo";
};

export type DeviceTokenResponseDto = {
  success: boolean;
  message: string;
  tokenId: number;
};

export type TestNotificationDto = {
  title?: string;
  body: string;
};

// --- User Discount DTO (добавлено из openapi) ---
export type UserDiscountDto = {
  available: boolean;
  percent: number;
};

// --- User Preferences DTOs (новые) ---
export type SetFavoriteCurrenciesDto = {
  currencyCodes: string[];
};
export type SetFavoriteCurrenciesResponseDto = {
  message: string;
};
export type SetDefaultCurrencyDto = {
  currencyCode: string | null;
};
export type SetDefaultCurrencyResponseDto = {
  message: string;
};
