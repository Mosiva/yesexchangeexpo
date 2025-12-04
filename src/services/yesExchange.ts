import { restApi } from "../api";
import type {
  BitrixEventDto,
  BitrixResponseDto,
  // bitrix
  BitrixWebhookDto,
  // bookings
  BookingDto,
  BookingStatus,
  // branches
  BranchDto,
  CancelBookingResponseDto,
  ContactFormResponseDto,
  CreateBookingDto,
  CreateFeedbackDto,
  CreateGuestBookingDto,
  CurrencyCode,
  // dictionaries
  CurrencyDto,
  DeviceTokenResponseDto,
  ExchangeRateDto,
  ExchangeRateHistoryRecordDto,
  GuestBookingTokenResponseDto,
  // health
  HealthCheckResponseDto,
  LoginDto,
  LogoutResponseDto,
  // nbk
  NbkRateDto,
  // news
  NewsDto,
  OtpRequestResultDto,
  // rates
  Paginated,
  RefreshTokenResponseDto,
  // push
  RegisterDeviceTokenDto,
  // auth
  RegisterDto,
  ResendOtpDto,
  SetDefaultCurrencyDto,
  SetDefaultCurrencyResponseDto,
  SetFavoriteCurrenciesDto,
  SetFavoriteCurrenciesResponseDto,
  TestNotificationDto,
  ToAmountQueryDto,
  ToAmountResponseDto,
  UpdateUserDto,
  // user
  UserDto,
  VerifyGuestOtpDto,
  VerifyOtpDto,
  VerifyOtpResponseDto
} from "../types/api";

export const yesExchangeApi = restApi.injectEndpoints({
  endpoints: (build) => ({
    // --- Health ---
    health: build.query<HealthCheckResponseDto, void>({
      query: () => ({ url: "/api/v1/health", method: "GET" }),
    }),
    healthLiveness: build.query<HealthCheckResponseDto, void>({
      query: () => ({ url: "/api/v1/health/liveness", method: "GET" }),
    }),
    healthReadiness: build.query<HealthCheckResponseDto, void>({
      query: () => ({ url: "/api/v1/health/readiness", method: "GET" }),
    }),

    // --- Авторизация ---
    register: build.mutation<OtpRequestResultDto, RegisterDto>({
      query: (data) => ({ url: "/api/v1/auth/register", method: "POST", data }),
    }),
    login: build.mutation<OtpRequestResultDto, LoginDto>({
      query: (data) => ({ url: "/api/v1/auth/login", method: "POST", data }),
    }),
    verifyOtp: build.mutation<VerifyOtpResponseDto, VerifyOtpDto>({
      query: (data) => ({
        url: "/api/v1/auth/otp/verify",
        method: "POST",
        data,
      }),
    }),
    resendOtp: build.mutation<OtpRequestResultDto, ResendOtpDto>({
      query: (data) => ({
        url: "/api/v1/auth/otp/resend",
        method: "POST",
        data,
      }),
    }),
    refreshToken: build.mutation<RefreshTokenResponseDto, void>({
      query: () => ({ url: "/api/v1/auth/token/refresh", method: "POST" }),
    }),
    logout: build.mutation<LogoutResponseDto, void>({
      query: () => ({ url: "/api/v1/auth/logout", method: "POST" }),
    }),

    // --- Текущий пользователь ---
    me: build.query<UserDto, void>({
      query: () => ({ url: "/api/v1/me", method: "GET" }),
      providesTags: ["Users"],
    }),
    updateMe: build.mutation<UserDto, UpdateUserDto>({
      query: (data) => ({ url: "/api/v1/me", method: "PATCH", data }),
      invalidatesTags: ["Users"],
    }),
    // --- Предпочтения пользователя (User Preferences) ---
    getFavoriteCurrencies: build.query<string[], void>({
      query: () => ({
        url: "/api/v1/me/preferences/favorite-currencies",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    setFavoriteCurrencies: build.mutation<
      SetFavoriteCurrenciesResponseDto,
      SetFavoriteCurrenciesDto
    >({
      query: (data) => ({
        url: "/api/v1/me/preferences/favorite-currencies",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),
    getDefaultCurrency: build.query<string | null, void>({
      query: () => ({
        url: "/api/v1/me/preferences/default-currency",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    setDefaultCurrency: build.mutation<
      SetDefaultCurrencyResponseDto,
      SetDefaultCurrencyDto
    >({
      query: (data) => ({
        url: "/api/v1/me/preferences/default-currency",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // --- Валюты ---
    currencies: build.query<CurrencyDto[], void>({
      query: () => ({ url: "/api/v1/currencies", method: "GET" }),
    }),
    currencyByCode: build.query<CurrencyDto, { code: CurrencyCode | string }>({
      query: ({ code }) => ({
        url: `/api/v1/currencies/${encodeURIComponent(code)}`,
        method: "GET",
      }),
    }),

    // --- Филиалы ---
    branches: build.query<BranchDto[], void>({
      query: () => ({ url: "/api/v1/branches", method: "GET" }),
      providesTags: (r) => (r ? [{ type: "City" as const, id: "LIST" }] : []),
    }),
    nearestBranches: build.query<BranchDto[], { lng: number; lat: number }>({
      query: (params) => ({
        url: "/api/v1/branches/nearest",
        method: "GET",
        params,
      }),
    }),
    nearestBranch: build.query<BranchDto, { lng: number; lat: number }>({
      query: (params) => ({
        url: "/api/v1/branches/nearest/one",
        method: "GET",
        params,
      }),
    }),
    branchById: build.query<BranchDto, { id: number }>({
      query: ({ id }) => ({ url: `/api/v1/branches/${id}`, method: "GET" }),
    }),

    // --- Курсы (текущие) ---
    exchangeRatesCurrent: build.query<
      Paginated<ExchangeRateDto>,
      {
        branchId: number;
        page?: number;
        limit?: number;
        sortBy?: ("updatedAt:ASC" | "updatedAt:DESC")[];
        search?: string;
        currencyCodes?: string[]; // ISO-4217 (по openapi)
        searchBy?: "currencyCode"[];
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(String(branchId))}`,
        method: "GET",
        params,
      }),
    }),

    // --- Курсы (история изменений) ---
    exchangeRatesChanges: build.query<
      Paginated<ExchangeRateHistoryRecordDto>,
      {
        branchId: number;
        from?: string; // yyyy-MM-dd
        to?: string; // yyyy-MM-dd
        currencyCodes?: string[];
        page?: number;
        limit?: number;
        sortBy?: ("changedAt:ASC" | "changedAt:DESC")[];
        search?: string;
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(
          String(branchId)
        )}/changes`,
        method: "GET",
        params,
      }),
    }),

    // --- НБК (Нацбанк) ---
    nbkRates: build.query<
      NbkRateDto[],
      {
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
        currencyCode?: string;
      }
    >({
      query: (params) => ({
        url: "/api/v1/nbk/exchange-rates",
        method: "GET",
        params,
      }),
    }),

    // --- Бронирования (пользователь) ---
    bookings: build.query<
      Paginated<BookingDto, { statuses?: BookingStatus[] }>,
      {
        from?: string; // yyyy-MM-dd
        to?: string; // yyyy-MM-dd
        statuses?: BookingStatus[];
        page?: number;
        limit?: number;
        sortBy?: (
          | "id:ASC"
          | "id:DESC"
          | "createdAt:ASC"
          | "createdAt:DESC"
          | "updatedAt:ASC"
          | "updatedAt:DESC"
        )[];
        search?: string;
        "filter.status"?: string[];
        "filter.operationType"?: string[];
        searchBy?: "number"[];
      }
    >({
      query: (params) => ({
        url: "/api/v1/bookings",
        method: "GET",
        params,
      }),
    }),
    createBooking: build.mutation<BookingDto, CreateBookingDto>({
      query: (data) => ({ url: "/api/v1/bookings", method: "POST", data }),
    }),
    bookingById: build.query<BookingDto, { id: number }>({
      query: ({ id }) => ({ url: `/api/v1/bookings/${id}`, method: "GET" }),
    }),
    cancelBooking: build.mutation<CancelBookingResponseDto, { id: number }>({
      query: ({ id }) => ({
        url: `/api/v1/bookings/${id}/cancel`,
        method: "POST",
      }),
    }),
    toAmount: build.mutation<ToAmountResponseDto, ToAmountQueryDto>({
      query: (data) => ({
        url: "/api/v1/bookings/to-amount",
        method: "POST",
        data,
      }),
    }),

    // --- Бронирования (гость) ---
    requestGuestOtp: build.mutation<OtpRequestResultDto, { phone: string }>({
      query: ({ phone }) => ({
        url: "/api/v1/bookings/guest/otp/request",
        method: "POST",
        params: { phone },
      }),
    }),
    verifyGuestOtp: build.mutation<
      GuestBookingTokenResponseDto,
      VerifyGuestOtpDto
    >({
      query: (data) => ({
        url: "/api/v1/bookings/guest/otp/verify",
        method: "POST",
        data,
      }),
    }),
    createGuestBooking: build.mutation<
      BookingDto,
      { phone: string; data: CreateGuestBookingDto }
    >({
      query: ({ phone, data }) => ({
        url: "/api/v1/bookings/guest",
        method: "POST",
        params: { phone },
        data,
      }),
    }),
    guestBookingById: build.query<BookingDto, { id: number; phone: string }>({
      query: ({ id, phone }) => ({
        url: `/api/v1/bookings/guest/${id}`,
        method: "GET",
        params: { phone },
      }),
    }),

    // --- Новости ---
    news: build.query<
      Paginated<NewsDto, { source?: string | string[] }>,
      {
        page?: number;
        limit?: number;
        "filter.source"?: string[];
        sortBy?: (
          | "publishedAt:ASC"
          | "publishedAt:DESC"
          | "createdAt:ASC"
          | "createdAt:DESC"
        )[];
        search?: string;
        searchBy?: ("title" | "content")[];
      }
    >({
      query: (params) => ({ url: "/api/v1/news", method: "GET", params }),
    }),
    newsById: build.query<NewsDto, { id: number }>({
      query: ({ id }) => ({ url: `/api/v1/news/${id}`, method: "GET" }),
    }),

    // --- Формы обратной связи ---
    submitJobApplication: build.mutation<ContactFormResponseDto, FormData>({
      query: (formData) => ({
        url: "/api/v1/contact-forms/job-application",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    submitFeedback: build.mutation<ContactFormResponseDto, CreateFeedbackDto>({
      query: (data) => ({
        url: "/api/v1/contact-forms/feedback",
        method: "POST",
        data,
      }),
    }),

    // --- Bitrix ---
    bitrixWebhook: build.mutation<BitrixResponseDto, BitrixWebhookDto>({
      query: (data) => ({
        url: "/api/v1/bitrix/webhook",
        method: "POST",
        data,
      }),
    }),
    bitrixEvent: build.mutation<BitrixResponseDto, BitrixEventDto>({
      query: (data) => ({
        url: "/api/v1/bitrix/events",
        method: "POST",
        data,
      }),
    }),

    // --- Push Notifications ---
    registerDeviceToken: build.mutation<
      DeviceTokenResponseDto,
      RegisterDeviceTokenDto
    >({
      query: (data) => ({
        url: "/api/v1/notifications/push/device-token",
        method: "POST",
        data,
      }),
    }),
    sendTestPush: build.mutation<void, TestNotificationDto>({
      query: (data) => ({
        url: "/api/v1/notifications/push",
        method: "POST",
        data,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  // health
  useHealthQuery,
  useHealthLivenessQuery,
  useHealthReadinessQuery,

  // auth
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useRefreshTokenMutation,
  useLogoutMutation,

  // user
  useMeQuery,
  useUpdateMeMutation,

  // currencies
  useCurrenciesQuery,
  useCurrencyByCodeQuery,

  // branches
  useBranchesQuery,
  useNearestBranchesQuery,
  useNearestBranchQuery,
  useBranchByIdQuery,

  // rates
  useExchangeRatesCurrentQuery,
  useExchangeRatesChangesQuery,

  // nbk
  useNbkRatesQuery,

  // bookings (auth)
  useBookingsQuery,
  useCreateBookingMutation,
  useBookingByIdQuery,
  useCancelBookingMutation,
  useToAmountMutation,

  // bookings (guest)
  useRequestGuestOtpMutation,
  useVerifyGuestOtpMutation,
  useCreateGuestBookingMutation,
  useGuestBookingByIdQuery,

  // news
  useNewsQuery,
  useNewsByIdQuery,

  // contact forms
  useSubmitJobApplicationMutation,
  useSubmitFeedbackMutation,

  // bitrix
  useBitrixWebhookMutation,
  useBitrixEventMutation,

  // push
  useRegisterDeviceTokenMutation,
  useSendTestPushMutation,

  // user preferences
  useGetFavoriteCurrenciesQuery,
  useSetFavoriteCurrenciesMutation,
  useGetDefaultCurrencyQuery,
  useSetDefaultCurrencyMutation,
} = yesExchangeApi;
