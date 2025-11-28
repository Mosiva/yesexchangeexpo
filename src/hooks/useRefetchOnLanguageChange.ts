import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type RefetchFn = () => Promise<any> | any;

export function useRefetchOnLanguageChange(refetchers: RefetchFn[]) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!i18n.language) return;

    // 🔁 Перезапускаем все переданные refetch-функции
    refetchers.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.log("❗ Refetch error:", e);
      }
    });
  }, [i18n.language]);
}
