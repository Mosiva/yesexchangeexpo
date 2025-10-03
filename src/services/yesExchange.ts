import { restApi } from "../api";
import type {
  BranchDto,
  CreateUserDto,
  CurrencyCode,
  DeltaPeriod,
  ExchangeRateDto,
  ExchangeRateHistoryRecordDto,
  LoginDto,
  MessageResponseDto,
  NbkExchangeRateDto,
  Paginated,
  RegisterDto,
  ResendOtpDto,
  UpdateUserDto,
  UserDto,
  VerifyOtpDto,
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

    // --- Пользователь ---
    me: build.query<UserDto, void>({
      query: () => ({ url: "/api/v1/me", method: "GET" }),
      providesTags: ["Users"],
    }),
    updateMe: build.mutation<MessageResponseDto, UpdateUserDto>({
      query: (data) => ({ url: "/api/v1/me", method: "PATCH", data }),
      invalidatesTags: ["Users"],
    }),

    // --- Филиалы ---
    branches: build.query<
      Paginated<BranchDto, { residentRK?: string | string[] }>,
      {
        page?: number;
        limit?: number;
        sortBy?: ("id:ASC" | "id:DESC" | "city:ASC" | "city:DESC")[];
        search?: string;
        searchBy?: ("city" | "address")[];
      }
    >({
      query: (params) => ({ url: "/api/v1/branches", method: "GET", params }),
      providesTags: (r) =>
        r?.data ? [{ type: "City" as const, id: "LIST" }] : [],
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

    // --- Курсы (текущие) ---
    exchangeRatesCurrent: build.query<
      Paginated<ExchangeRateDto>,
      {
        branchId: string;
        deltaPeriod: DeltaPeriod; // обязательный
        currencies?: CurrencyCode[]; // сериализация массивов — репитерами
        page?: number;
        limit?: number;
        sortBy?: (
          | "currency:ASC"
          | "currency:DESC"
          | "updatedAt:ASC"
          | "updatedAt:DESC"
        )[];
        search?: string;
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(branchId)}`,
        method: "GET",
        params,
      }),
    }),

    // --- Курсы (история) ---
    exchangeRatesHistory: build.query<
      Paginated<ExchangeRateHistoryRecordDto>,
      {
        branchId: string;
        currency?: CurrencyCode; // можно фильтровать по валюте
        from?: string; // YYYY-MM-DD
        to?: string; // YYYY-MM-DD
        page?: number;
        limit?: number;
        sortBy?: ("changedAt:ASC" | "changedAt:DESC")[];
        search?: string;
      }
    >({
      query: ({ branchId, ...params }) => ({
        url: `/api/v1/exchange-rates/${encodeURIComponent(branchId)}/history`,
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
        currencies?: CurrencyCode[]; // список кодов
        page?: number;
        limit?: number;
        sortBy?: ("date:ASC" | "date:DESC")[];
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/api/v1/nbk/exchange-rates/average",
        method: "GET",
        params,
      }),
    }),

    // --- Админ ---
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

    adminUsers: build.query<
      Paginated<UserDto>,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/api/v1/admin/users",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),

    adminUser: build.query<UserDto, { id: number }>({
      query: ({ id }) => ({ url: `/api/v1/admin/users/${id}`, method: "GET" }),
      providesTags: (_r, _e, { id }) => [{ type: "Users", id }],
    }),

    // Лучше не слать лишние поля (id/даты) при создании
    adminCreateUser: build.mutation<MessageResponseDto, CreateUserDto>({
      query: (data) => ({ url: "/api/v1/admin/users", method: "POST", data }),
      invalidatesTags: ["Users"],
    }),

    adminUpdateUser: build.mutation<
      MessageResponseDto,
      { id: number; data: UpdateUserDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/admin/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users", id }],
    }),

    adminDeleteUser: build.mutation<MessageResponseDto, { id: number }>({
      query: ({ id }) => ({
        url: `/api/v1/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // --- Healthcheck ---
    health: build.query<unknown, void>({
      query: () => ({ url: "/api/v1/health", method: "GET" }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useMeQuery,
  useUpdateMeMutation,
  useBranchesQuery,
  useNearestBranchesQuery,
  useNearestBranchQuery,
  useExchangeRatesCurrentQuery,
  useExchangeRatesHistoryQuery,
  useNbkAverageQuery,
  useAdminPullBranchesMutation,
  useAdminPullExchangeRatesMutation,
  useAdminUsersQuery,
  useAdminUserQuery,
  useAdminCreateUserMutation,
  useAdminUpdateUserMutation,
  useAdminDeleteUserMutation,
  useHealthQuery,
} = yesExchangeApi;
