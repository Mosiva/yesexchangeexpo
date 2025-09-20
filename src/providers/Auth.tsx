import AsyncStorage from "@react-native-async-storage/async-storage";
import { setOnAuthFail } from "api";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "services";
import i18n, { STORE_LANGUAGE_KEY } from "../local/i18n";

import type { User } from "../types";

const STORE_GUEST_KEY = "is_guest";
const ACCESS_TOKEN_KEY = "access_token";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: { text: string };
  language: string;
  isGuest: boolean;
  onAuthFail(): void;
}

export interface AuthContextProps extends AuthState {
  // login(credentials) больше не нужен — логин через OTP
  logout(): void;
  changeLanguage(lang: string): Promise<void>;
  enterAsGuest(): Promise<void>;
  finalizeLogin(payload: {
    access: string;
    refresh?: string | null;
    user?: User | null;
  }): Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

const { useLogoutMutation } = authApi;

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [logout] = useLogoutMutation();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ text: "" });
  const [language, setLanguage] = useState("ru");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const storedToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
      const storedLang =
        (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
      const storedGuest = await AsyncStorage.getItem(STORE_GUEST_KEY);

      console.log("Stored Access Token:", storedToken);
      console.log("Stored Refresh Token:", storedRefreshToken);

      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      } else if (storedGuest === "true") {
        setIsAuthenticated(true);
        setIsGuest(true);
      }
    };

    initialize();
    setOnAuthFail(handleAuthFail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterAsGuest = async () => {
    await AsyncStorage.setItem(STORE_GUEST_KEY, "true");
    setIsAuthenticated(true);
    setIsGuest(true);
  };

  // вызывать после успешной верификации OTP
  const finalizeLogin = async ({
    access,
    refresh,
    user: company,
  }: {
    access: string;
    refresh?: string | null;
    user?: User | null;
  }) => {
    console.log("OTP finalize — access:", access, "refresh:", refresh);
    setToken(access);
    setUser(company ?? null);
    setIsAuthenticated(true);
    setIsGuest(false);
    setError({ text: "" });
    await AsyncStorage.multiSet([
      ["access_token", access],
      ["refresh_token", refresh ?? ""],
    ]);
  };
  const handleLogout = async () => {
    console.log("Logging out - clearing tokens (server + local)");

    try {
      // уведомляем бэк
      await logout().unwrap();
    } catch (e) {
      console.warn("Server logout failed (возможно, токен истёк)", e);
    }
    setIsAuthenticated(false);
    setIsGuest(false);
    setToken(null);
    setUser(null);
    setError({ text: "" });

    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        STORE_GUEST_KEY,
      ]);
    } catch (e) {
      console.warn("Failed to clear storage", e);
    }
    AsyncStorage.clear();

    router.push("/(auth)/choose-language");
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
        isAuthenticated,
        isLoading,
        error,
        language,
        // login удалили
        logout: handleLogout,
        changeLanguage: handleChangeLanguage,
        isGuest,
        enterAsGuest,
        onAuthFail: handleAuthFail,
        finalizeLogin,
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
