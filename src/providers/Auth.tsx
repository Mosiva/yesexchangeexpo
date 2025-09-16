// auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCsrfRefresher, setOnAuthFail } from "api";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "services";
import i18n, { STORE_LANGUAGE_KEY } from "../local/i18n";

import type { AuthCredentials, User } from "../types";

const STORE_GUEST_KEY = "is_guest";
const ACCESS_TOKEN_KEY = "access_token";
const CSRF_TOKEN_KEY = "csrf_token";

export interface AuthState {
  user: User | null;
  token: string | null;
  csrf: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: { text: string };
  language: string;
  isGuest: boolean;
  onAuthFail(): void;
}

export interface AuthContextProps extends AuthState {
  login(credentials: AuthCredentials): Promise<string | undefined>;
  logout(): void;
  // ⬇️ делаем параметр опциональным и возвращаем null при неудаче
  getcsrf(credentials?: AuthCredentials): Promise<string | null>;
  changeLanguage(lang: string): Promise<void>;
  enterAsGuest(): Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

const { useLoginMutation, useLazyGetCSRFQuery, useLogoutMutation } = authApi;

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [getcsrfQuery] = useLazyGetCSRFQuery();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [csrf, setCsrf] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ text: "" });
  const [language, setLanguage] = useState("ru");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
      const storedCsrf = await AsyncStorage.getItem(CSRF_TOKEN_KEY);
      const storedLang =
        (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
      const storedGuest = await AsyncStorage.getItem(STORE_GUEST_KEY);

      // Console log the stored tokens
      console.log("Stored Access Token:", storedToken);
      console.log("Stored Refresh Token:", storedRefreshToken);

      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);
      if (storedCsrf) setCsrf(storedCsrf);

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      } else if (storedGuest === "true") {
        setIsAuthenticated(true);
        setIsGuest(true);
      }
    };

    initialize();

    setCsrfRefresher(async () => {
      const newCsrf = await handleCsrf();
      return newCsrf; // string|null
    });
    setOnAuthFail(handleAuthFail);
  }, []);

  const enterAsGuest = async () => {
    await AsyncStorage.setItem(STORE_GUEST_KEY, "true");
    setIsAuthenticated(true);
    setIsGuest(true);
  };

  const handleCsrf = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const { data } = await getcsrfQuery().unwrap();
      const csrfToken =
        data?.csrfToken ?? data?.data?.csrfToken ?? data?.token ?? null;
      if (csrfToken) {
        setCsrf(csrfToken);
        setError({ text: "" });
        await AsyncStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
        return csrfToken;
      }
      return null;
    } catch (err) {
      setError({ text: JSON.stringify(err) });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      // если бэкенд требует CSRF на /login — раскомментируй:
      await handleCsrf();

      const {
        access,
        refresh,
        user: company,
      } = await login(credentials).unwrap();

      // Console log the tokens
      console.log("Access Token:", access);
      console.log("Refresh Token:", refresh);

      if (access) {
        setToken(access);
        setUser(company ?? null);
        setIsAuthenticated(true);
        setIsGuest(false);
        setError({ text: "" });

        await AsyncStorage.multiSet([
          ["access_token", access],
          ["refresh_token", refresh ?? ""],
        ]);

        return access;
      }
    } catch (err) {
      setError({ text: JSON.stringify(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out - clearing tokens");
    try {
      await logout().unwrap(); // 🔐 Уведомить бэк + CSRF защита уже есть
    } catch (e) {
      console.warn("Server logout failed (может быть уже истек токен)", e);
    }

    // ✅ Чистим локально
    setIsAuthenticated(false);
    setIsGuest(false);
    setToken(null);
    setUser(null);
    setCsrf(null);
    setError({ text: "" });

    await AsyncStorage.multiRemove([
      "access_token",
      "refresh_token",
      "csrf_token",
      STORE_GUEST_KEY,
    ]);

    router.replace("/(auth)");
  };

  const handleChangeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lang);
      setLanguage(lang);
      i18n.changeLanguage(lang);
    } catch (e) {
      console.error("Language change failed", e);
    }
  };
  const handleAuthFail = () => {
    console.log("❌ Refresh token invalid — redirecting to login...");
    handleLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        csrf,
        isAuthenticated,
        isLoading,
        error,
        language,
        login: handleLogin,
        logout: handleLogout,
        changeLanguage: handleChangeLanguage,
        getcsrf: handleCsrf,
        isGuest,
        enterAsGuest,
        onAuthFail: handleAuthFail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
