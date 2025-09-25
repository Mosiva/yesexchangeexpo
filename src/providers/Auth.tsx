// src/providers/AuthProvider.tsx
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
  const [isLoading, setIsLoading] = useState(true);
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

      console.log("🔑 Init AuthProvider");
      console.log("   stored access:", storedToken?.slice(0, 20) + "...");
      console.log(
        "   stored refresh:",
        storedRefreshToken?.slice(0, 20) + "..."
      );
      console.log("   stored guest:", storedGuest);

      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);

      if (storedToken) {
        console.log("✅ Found access token → authenticated user mode");
        setToken(storedToken);
        setIsAuthenticated(true);
        setIsGuest(false);
      } else if (storedGuest === "true") {
        console.log("👤 Guest mode restored");
        setIsAuthenticated(true);
        setIsGuest(true);
      } else {
        console.log("🚀 First launch → guest mode + RU");
        await AsyncStorage.multiSet([
          [STORE_LANGUAGE_KEY, "ru"],
          [STORE_GUEST_KEY, "true"],
        ]);
        setIsAuthenticated(true);
        setIsGuest(true);
        setLanguage("ru");
        i18n.changeLanguage("ru");

        router.replace("/(tabs)/(main)");
      }

      setIsLoading(false);
    };

    initialize();
    setOnAuthFail(handleAuthFail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterAsGuest = async () => {
    console.log("👤 Entering guest mode");
    await AsyncStorage.setItem(STORE_GUEST_KEY, "true");
    setIsAuthenticated(true);
    setIsGuest(true);
  };

  const finalizeLogin = async ({
    access,
    refresh,
    user: company,
  }: {
    access: string;
    refresh?: string | null;
    user?: User | null;
  }) => {
    console.log(
      "✅ finalizeLogin — access:",
      access.slice(0, 20) + "...",
      "refresh:",
      refresh?.slice(0, 20) + "..."
    );
    setToken(access);
    setUser(company ?? null);
    setIsAuthenticated(true);
    setIsGuest(false);
    setError({ text: "" });
    await AsyncStorage.multiSet([
      ["access_token", access],
      ["refresh_token", refresh ?? ""],
      [STORE_GUEST_KEY, "false"],
    ]);
  };

  const handleLogout = async () => {
    console.log("🚪 Logging out - clearing tokens (server + local)");

    const access = await AsyncStorage.getItem("access_token");

    if (access) {
      try {
        console.log(
          "➡️ API /auth/logout with token:",
          access.slice(0, 20) + "..."
        );
        await logout().unwrap();
        console.log("⬅️ Logout success");
      } catch (e) {
        console.warn("⚠️ Server logout failed (maybe token expired)", e);
      }
    } else {
      console.log("ℹ️ No access token, skipping server logout");
    }

    // 👉 переводим в guest mode
    setIsAuthenticated(true);
    setIsGuest(true);
    setToken(null);
    setUser(null);
    setError({ text: "" });

    try {
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
      await AsyncStorage.setItem(STORE_GUEST_KEY, "true");
      console.log("🗑 Cleared tokens, set guest mode");
    } catch (e) {
      console.warn("⚠️ Failed to clear storage", e);
    }

    // 🚀 сразу на main
    router.replace("/(tabs)/(main)");
  };
  const handleChangeLanguage = async (lang: string) => {
    console.log("🌐 Changing language →", lang);
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lang);
      setLanguage(lang);
      i18n.changeLanguage(lang);
    } catch (e) {
      console.error("❌ Language change failed", e);
    }
  };

  const handleAuthFail = () => {
    console.log("❌ Refresh token invalid — forcing logout");
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
