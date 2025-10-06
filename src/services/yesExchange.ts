// src/services/yesExchange.ts
import { restApi } from "../api";
import type {
  AdminBookingDto,
  // bookings
  BookingDto,
  BookingStatus,
  // branches
  BranchDto,
  CreateBookingDto,
  CreateUserViolationDto,
  CreateViolationTypeDto,
  // dictionaries
  CurrencyCode,
  CurrencyDto,
  // rates
  DeltaPeriod,
  ExchangeRateDto,
  ExchangeRateHistoryRecordDto,
  LoginDto,
  MessageResponseDto,
  // nbk
  NbkExchangeRateDto,
  // pagination
  Paginated,
  RegisterDto,
  ResendOtpDto,
  SetFavoriteCurrenciesDto,
  ToAmountQueryDto,
  ToAmountResponseDto,
  UpdateBookingStatusDto,
  UpdateUserDto,
  UpdateViolationTypeDto,
  UserDto,
  UserViolationDto,
  VerifyOtpDto,
  // violations
  ViolationTypeDto
} from "../types/api";

export const yesExchangeApi = restApi.injectEndpoints({
  endpoints: (build) => ({
    // --- Авторизация ---
    register: build.mutation<MessageResponseDto, RegisterDto>({
      query: (data) => ({ url: "/api/v1/auth/register", method: "POST", data }),
    }),
    login: build.mutation<MessageResponseDto, LoginDto>({
      query: (data) => ({ url: "/api/v1/auth/login", method: "POST", data }),
    }),
    verifyOtp: build.mutation<MessageResponseDto, VerifyOtpDto>({
      query: (data) => ({
        url: "/api/v1/auth/otp/verify",
        method: "POST",
        data,
      }),
    }),
    resendOtp: build.mutation<MessageResponseDto, ResendOtpDto>({
      query: (data) => ({
        url: "/api/v1/auth/otp/resend",
        method: "POST",
        data,
      }),
    }),
    logout: build.mutation<MessageResponseDto, void>({
      query: () => ({ url: "/api/v1/auth/logout", method: "POST" }),
    }),

    // --- Текущий пользователь ---
    me: build.query<UserDto, void>({
      query: () => ({ url: "/api/v1/me", method: "GET" }),
      providesTags: ["Users"],
    }),
    updateMe: build.mutation<MessageResponseDto, UpdateUserDto>({
      query: (data) => ({ url: "/api/v1/me", method: "PATCH", data }),
      invalidatesTags: ["Users"],
    }),

    // --- Предпочтения пользователя: избранные валюты ---
    getFavoriteCurrencies: build.query<string[], void>({
      query: () => ({
        url: "/api/v1/me/preferences/favorite-currencies",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    setFavoriteCurrencies: build.mutation<
      MessageResponseDto,
      SetFavoriteCurrenciesDto
    >({
      query: (data) => ({
        url: "/api/v1/me/preferences/favorite-currencies",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // --- Валюты ---
    currencies: build.query<CurrencyDto[], void>({
      query: () => ({ url: "/api/v1/currencies", method: "GET" }),
    }),
    currencyByCode: build.query<CurrencyDto, { code: CurrencyCode }>({
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
      query: ({ id }) => ({
        url: `/api/v1/branches/${id}`,
        method: "GET",
      }),
    }),

    // --- Курсы (текущие) ---
    exchangeRatesCurrent: build.query<
      Paginated<ExchangeRateDto>,
      {
        branchId: number;
        deltaPeriod: DeltaPeriod; // обязательно
        currencyCodes?: string[]; // ISO-4217
        page?: number;
        limit?: number;
        sortBy?: ("updatedAt:ASC" | "updatedAt:DESC")[];
        search?: string;
        searchBy?: "currencyCode"[];
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(String(branchId))}`,
        method: "GET",
        params,
      }),
    }),

    // --- Курсы (история) ---
    exchangeRatesHistory: build.query<
      Paginated<ExchangeRateHistoryRecordDto>,
      {
        branchId: number;
        deltaPeriod: DeltaPeriod; // обязательно
        currencyCodes?: string[];
        from?: string; // YYYY-MM-DD
        to?: string; // YYYY-MM-DD
        page?: number;
        limit?: number;
        sortBy?: ("changedAt:ASC" | "changedAt:DESC")[];
        search?: string;
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(
          String(branchId)
        )}/history`,
        method: "GET",
        params,
      }),
    }),

    // --- НБК (Нацбанк) ---
    nbkAverage: build.query<
      NbkExchangeRateDto[],
      {
        from?: string; // YYYY-MM-DD
        to?: string; // YYYY-MM-DD
        currencyCodes?: string[];
        page?: number;
        limit?: number;
        sortBy?: string[];
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/api/v1/nbk/exchange-rates/average",
        method: "GET",
        params,
      }),
    }),

    // --- Бронирования (пользователь) ---
    bookingsHistory: build.query<
      Paginated<BookingDto, { statuses?: BookingStatus[] }>,
      {
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
        statuses?: BookingStatus[];
        from?: string; // YYYY-MM-DD
        to?: string; // YYYY-MM-DD
        searchBy?: "number"[];
        "filter.status"?: string[]; // спец. фильтр-операторы, если нужно
        "filter.operationType"?: string[];
      }
    >({
      query: (params) => ({
        url: "/api/v1/bookings/history",
        method: "GET",
        params,
      }),
    }),
    createBooking: build.mutation<MessageResponseDto, CreateBookingDto>({
      query: (data) => ({ url: "/api/v1/bookings", method: "POST", data }),
    }),
    bookingById: build.query<BookingDto, { id: number }>({
      query: ({ id }) => ({ url: `/api/v1/bookings/${id}`, method: "GET" }),
    }),
    // --- Бронирования (гость) ---
    createGuestBooking: build.mutation<
      MessageResponseDto,
      { phone: string; data: CreateBookingDto }
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
    cancelBooking: build.mutation<
      MessageResponseDto,
      { id: number; phone: string }
    >({
      query: ({ id, phone }) => ({
        url: `/api/v1/bookings/${id}/cancel`,
        method: "POST",
        params: { phone },
      }),
    }),
    toAmount: build.mutation<ToAmountResponseDto, ToAmountQueryDto>({
      query: (data) => ({
        url: "/api/v1/bookings/to-amount",
        method: "POST",
        data,
      }),
    }),

    // --- Админ. Бронирования ---
    adminBookings: build.query<
      Paginated<AdminBookingDto>,
      {
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
        searchBy?: "number"[];
        "filter.status"?: string[];
        "filter.operationType"?: string[];
      }
    >({
      query: (params) => ({
        url: "/api/v1/admin/bookings",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),
    adminBookingUpdateStatus: build.mutation<
      MessageResponseDto,
      { id: number; data: UpdateBookingStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/admin/bookings/${id}/status`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Users"],
    }),
    adminBookingCancel: build.mutation<MessageResponseDto, { id: number }>({
      query: ({ id }) => ({
        url: `/api/v1/admin/bookings/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),

    // --- Админ. Нарушения ---
    adminViolations: build.query<
      Paginated<UserViolationDto>,
      {
        page?: number;
        limit?: number;
        sortBy?: ("id:ASC" | "id:DESC" | "createdAt:ASC" | "createdAt:DESC")[];
        search?: string;
        searchBy?: "phone"[];
        "filter.violationTypeCode"?: string[];
        "filter.userId"?: string[];
      }
    >({
      query: (params) => ({
        url: "/api/v1/admin/violations",
        method: "GET",
        params,
      }),
    }),
    adminCreateViolation: build.mutation<
      MessageResponseDto,
      CreateUserViolationDto
    >({
      query: (data) => ({
        url: "/api/v1/admin/violations",
        method: "POST",
        data,
      }),
    }),
    adminViolationsByUser: build.query<unknown, { userId: number }>({
      query: ({ userId }) => ({
        url: `/api/v1/admin/violations/user/${userId}`,
        method: "GET",
      }),
    }),
    adminViolationsByPhone: build.query<unknown, { phone: string }>({
      query: ({ phone }) => ({
        url: `/api/v1/admin/violations/phone/${encodeURIComponent(phone)}`,
        method: "GET",
      }),
    }),
    adminViolationsByType: build.query<unknown, { typeCode: string }>({
      query: ({ typeCode }) => ({
        url: `/api/v1/admin/violations/type/${encodeURIComponent(typeCode)}`,
        method: "GET",
      }),
    }),
    adminViolationsStats: build.query<unknown, void>({
      query: () => ({
        url: "/api/v1/admin/violations/stats",
        method: "GET",
      }),
    }),

    // --- Админ. Типы нарушений ---
    adminViolationTypes: build.query<ViolationTypeDto[], void>({
      query: () => ({ url: "/api/v1/admin/violation-types", method: "GET" }),
    }),
    adminCreateViolationType: build.mutation<
      MessageResponseDto,
      CreateViolationTypeDto
    >({
      query: (data) => ({
        url: "/api/v1/admin/violation-types",
        method: "POST",
        data,
      }),
    }),
    adminActiveViolationTypes: build.query<ViolationTypeDto[], void>({
      query: () => ({
        url: "/api/v1/admin/violation-types/active",
        method: "GET",
      }),
    }),
    adminViolationType: build.query<ViolationTypeDto, { code: string }>({
      query: ({ code }) => ({
        url: `/api/v1/admin/violation-types/${encodeURIComponent(code)}`,
        method: "GET",
      }),
    }),
    adminUpdateViolationType: build.mutation<
      MessageResponseDto,
      { code: string; data: UpdateViolationTypeDto }
    >({
      query: ({ code, data }) => ({
        url: `/api/v1/admin/violation-types/${encodeURIComponent(code)}`,
        method: "PATCH",
        data,
      }),
    }),
    adminDeleteViolationType: build.mutation<
      MessageResponseDto,
      { code: string }
    >({
      query: ({ code }) => ({
        url: `/api/v1/admin/violation-types/${encodeURIComponent(code)}`,
        method: "DELETE",
      }),
    }),

    // --- Админ. Служебные ---
    adminPullBranches: build.mutation<void, void>({
      query: () => ({ url: "/api/v1/admin/branches/pull", method: "POST" }),
      invalidatesTags: ["City"],
    }),
    adminPullExchangeRates: build.mutation<void, void>({
      query: () => ({
        url: "/api/v1/admin/exchange-rates/pull",
        method: "POST",
      }),
    }),

    // --- Healthcheck ---
    health: build.query<unknown, void>({
      query: () => ({ url: "/api/v1/health", method: "GET" }),
    }),
  }),
  overrideExisting: true,
});

export const {
  // auth
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
  // user
  useMeQuery,
  useUpdateMeMutation,
  useGetFavoriteCurrenciesQuery,
  useSetFavoriteCurrenciesMutation,
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
  useExchangeRatesHistoryQuery,
  // nbk
  useNbkAverageQuery,
  // bookings (user)
  useBookingsHistoryQuery,
  useCreateBookingMutation,
  useBookingByIdQuery,
  // bookings (guest)
  useCreateGuestBookingMutation,
  useGuestBookingByIdQuery,
  useCancelBookingMutation,
  useToAmountMutation,
  // admin bookings
  useAdminBookingsQuery,
  useAdminBookingUpdateStatusMutation,
  useAdminBookingCancelMutation,
  // admin violations
  useAdminViolationsQuery,
  useAdminCreateViolationMutation,
  useAdminViolationsByUserQuery,
  useAdminViolationsByPhoneQuery,
  useAdminViolationsByTypeQuery,
  useAdminViolationsStatsQuery,
  // admin violation types
  useAdminViolationTypesQuery,
  useAdminCreateViolationTypeMutation,
  useAdminActiveViolationTypesQuery,
  useAdminViolationTypeQuery,
  useAdminUpdateViolationTypeMutation,
  useAdminDeleteViolationTypeMutation,
  // admin misc
  useAdminPullBranchesMutation,
  useAdminPullExchangeRatesMutation,
  // health
  useHealthQuery,
} = yesExchangeApi;
