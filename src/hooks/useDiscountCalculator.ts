import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToAmountMutation } from "../services/yesExchange";
import type { BookingOperationType } from "../types/api";

/** debounce */
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

type Args = {
  isGuest: boolean;
  clientDiscountAvailable: boolean;
  mode: BookingOperationType;
  baseAmount: number;
  fromAmount: number;
  exchangeRateId?: number;
  branchId?: number;
};

export function useDiscountCalculator({
  isGuest,
  clientDiscountAvailable,
  mode,
  baseAmount,
  fromAmount,
  exchangeRateId,
  branchId,
}: Args) {
  const [request, { isLoading }] = useToAmountMutation();
  const [serverCalc, setServerCalc] = useState<{
    toAmount?: number;
    discountPercent?: number;
  } | null>(null);

  const { t } = useTranslation();

  const debouncedAmount = useDebounce(fromAmount, 450);

  const canShowDiscount = useMemo(() => {
    if (isGuest) return false;
    if (clientDiscountAvailable === true) return true;
    if (baseAmount >= 500000) return true;
    return false;
  }, [isGuest, clientDiscountAvailable, baseAmount]);

  function roundAmount(value: number, precision = 2): number {
    if (!isFinite(value)) return 0;
    return Number(value.toFixed(precision));
  }

  // Только серверный запрос, никаких локальных вычислений
  useEffect(() => {
    if (!canShowDiscount) {
      setServerCalc(null);
      return;
    }

    if (!debouncedAmount || debouncedAmount <= 0) {
      setServerCalc(null);
      return;
    }

    if (!exchangeRateId || !branchId) return;

    request({
      branchId,
      exchangeRateId,
      amount: debouncedAmount.toString(),
      operationType: mode,
      isRateLocked: true,
    })
      .unwrap()
      .then((res) => {
        setServerCalc({
          toAmount: roundAmount(Number(res.toAmount)),
          discountPercent: res.discountPercent ?? 0,
        });
      })
      .catch(() => {
        setServerCalc(null);
      });
  }, [
    debouncedAmount,
    exchangeRateId,
    branchId,
    mode,
    canShowDiscount,
    request,
  ]);

  // Процент — только тот, что пришёл с бэка, никаких fallback
  const finalPercent = useMemo(() => {
    if (!canShowDiscount) return 0;
    return serverCalc?.discountPercent ?? 0;
  }, [serverCalc, canShowDiscount]);

  // Итоговая сумма — только серверная. Если её нет, возвращаем null.
  const finalAmount = useMemo(() => {
    if (!canShowDiscount) return null;

    if (serverCalc?.toAmount !== undefined) {
      return roundAmount(serverCalc.toAmount);
    }

    return null;
  }, [serverCalc, canShowDiscount]);

  const discountMessage = useMemo(() => {
    const isBuy = mode === "buy";

    if (!canShowDiscount) {
      return isBuy
        ? t(
            "norates.withrates.discountOnlyAvailableForAmountGreaterThan500000",
            "Скидка доступна только при сумме больше 500 000 тенге"
          )
        : t(
            "norates.withrates.premiumOnlyAvailableForAmountGreaterThan500000",
            "Наценка доступна только при сумме больше 500 000 тенге"
          );
    }

    if (clientDiscountAvailable === true) {
      return isBuy
        ? t(
            "norates.withrates.discountOnlyAvailableForFirstBookingOrAmountGreaterThan500000",
            "Скидка доступна только на первую бронь или сумму больше 500 000 тенге"
          )
        : t(
            "norates.withrates.premiumOnlyAvailableForFirstBookingOrAmountGreaterThan500000",
            "Наценка доступна только на первую бронь или сумму больше 500 000 тенге"
          );
    }

    return isBuy
      ? t(
          "norates.withrates.discountOnlyAvailableForAmountGreaterThan500000",
          "Скидка доступна только при сумме больше 500 000 тенге"
        )
      : t(
          "norates.withrates.premiumOnlyAvailableForAmountGreaterThan500000",
          "Наценка доступна только при сумме больше 500 000 тенге"
        );
  }, [canShowDiscount, clientDiscountAvailable, mode]);

  return {
    canShowDiscount,
    finalPercent,
    finalAmount,
    discountMessage,
    isLoading,
  };
}
