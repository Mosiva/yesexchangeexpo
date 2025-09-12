import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LanguageDetectorAsyncModule } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, kz, ru } from "./translations";

export const STORE_LANGUAGE_KEY = "settings.lang";

const languageDetectorPlugin: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  init: () => {},
  detect(callback) {
    AsyncStorage.getItem(STORE_LANGUAGE_KEY)
      .then((language) => {
        callback(language || "ru");
      })
      .catch((e) => {
        console.log("Error reading language", e);
        callback("ru");
      });
  },
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (e) {
      console.log("Error saving language", e);
    }
  },
};

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  kz: { translation: kz },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
