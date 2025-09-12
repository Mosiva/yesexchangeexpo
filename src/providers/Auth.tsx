import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { axiosInstance } from "api";
import { authApi } from "services";
import i18n, { STORE_LANGUAGE_KEY } from "../local/i18n";

import type { AuthCredentials, User } from "@/types";
const STORE_GUEST_KEY = "is_guest";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: { text: string };
  language: string;
  isGuest: boolean;
}

export interface AuthContextProps extends AuthState {
  login(credentials: AuthCredentials): Promise<string | undefined>;
  logout(): void;
  changeLanguage(lang: string): Promise<void>;
  enterAsGuest(): Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

const { useLoginMutation } = authApi;

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [login] = useLoginMutation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ text: "" });
  const [language, setLanguage] = useState("ru");
  const [axiosInterceptor, setAxiosInterceptor] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");
      const storedLang =
        (await AsyncStorage.getItem(STORE_LANGUAGE_KEY)) || "ru";
      const storedGuest = await AsyncStorage.getItem(STORE_GUEST_KEY);

      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        setupAxiosInterceptor(storedToken, storedLang);
      } else if (storedGuest === "true") {
        setIsAuthenticated(true);
        setIsGuest(true);
      }
    };

    initialize();
  }, []);

  const setupAxiosInterceptor = (accessToken: string, lang: string) => {
    if (axiosInterceptor !== null) {
      axiosInstance.interceptors.request.eject(axiosInterceptor);
    }

    const newInterceptor = axiosInstance.interceptors.request.use((config) => {
      config.headers?.set?.("Authorization", `Bearer ${accessToken}`);
      config.headers?.set?.("Accept-Language", lang);
      console.log("🔐 Attaching Bearer Token:", accessToken);
      return config;
    });

    setAxiosInterceptor(newInterceptor);
  };
  const enterAsGuest = async () => {
    await AsyncStorage.setItem(STORE_GUEST_KEY, "true");
    setIsAuthenticated(true);
    setIsGuest(true);
  };

  const handleLogin = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      const { token: access_token, company } = await login(
        credentials
      ).unwrap();

      if (access_token) {
        setToken(access_token);
        setUser(company);
        setIsAuthenticated(true);
        setError({ text: "" });

        await AsyncStorage.setItem("access_token", access_token);
        setupAxiosInterceptor(access_token, language);

        return access_token;
      }
    } catch (err) {
      setError({ text: JSON.stringify(err) });
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = () => {
    console.log("delete token: ", token);
    setIsAuthenticated(false);
    setIsGuest(false);
    setToken(null);
    setUser(null);
    setError({ text: "" });
    if (axiosInterceptor !== null) {
      axiosInstance.interceptors.request.eject(axiosInterceptor);
      setAxiosInterceptor(null);
    }
    AsyncStorage.removeItem("access_token");
    AsyncStorage.removeItem(STORE_GUEST_KEY);
    AsyncStorage.clear();
    router.replace("/(auth)/choose-language");
  };

  const handleChangeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lang);
      setLanguage(lang);
      i18n.changeLanguage(lang);

      if (token) {
        setupAxiosInterceptor(token, lang);
      }
    } catch (e) {
      console.error("Language change failed", e);
    }
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
        login: handleLogin,
        logout: handleLogout,
        changeLanguage: handleChangeLanguage,
        isGuest, // ✅ include
        enterAsGuest,
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
