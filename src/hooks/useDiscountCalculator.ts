import { useEffect, useMemo, useState } from "react";
import { useToAmountMutation } from "../services/yesExchange";
import type { BookingOperationType } from "../types/api";

type UseDiscountCalculatorArgs = {
  isGuest: boolean;
  clientDiscountAvailable: boolean;
  mode: BookingOperationType;
  baseAmount: number;
  exchangeRateId?: number;
  branchId?: number;
  dependencyKey?: unknown;
  fromAmount: number;
};

export function useDiscountCalculator({
  isGuest,
  clientDiscountAvailable, // true/false
  mode, // "buy" | "sell"
  baseAmount, // computed.from (в тенге)
  fromAmount, // computed.to (в валюте)
  exchangeRateId,
  branchId,
  dependencyKey, // любое значение, при изменении которого надо пересчитать
}: UseDiscountCalculatorArgs) {
  const [calculate, { isLoading }] = useToAmountMutation();
  const [serverCalc, setServerCalc] = useState<{
    toAmount?: number;
    discountPercent?: number;
  } | null>(null);

  // ✅ Правила "разрешена ли скидка"
  const canShowDiscount = useMemo(() => {
    if (isGuest) return false;

    if (clientDiscountAvailable === true) return true;

    if (baseAmount >= 500000) return true;

    return false;
  }, [clientDiscountAvailable, baseAmount, isGuest]);

  // ✅ Серверный запрос только при сумме ≥ 500k
  useEffect(() => {
    if (!canShowDiscount || baseAmount < 500000) {
      setServerCalc(null);
      return;
    }

    if (!exchangeRateId || !branchId) return;

    calculate({
      branchId,
      exchangeRateId,
      amount: fromAmount.toString(),
      operationType: mode,
      isRateLocked: true,
    })
      .unwrap()
      .then((res) => {
        setServerCalc({
          toAmount: Number(res.toAmount),
          discountPercent: res.discountPercent,
        });
      })
      .catch(() => {
        setServerCalc(null);
      });
  }, [
    canShowDiscount,
    baseAmount,
    exchangeRateId,
    branchId,
    mode,
    dependencyKey,
    calculate,
  ]);

  // ✅ Итоговый процент скидки
  const finalPercent = useMemo(() => {
    if (!canShowDiscount) return 0;

    if (serverCalc?.discountPercent) return serverCalc.discountPercent;

    return 5;
  }, [serverCalc, canShowDiscount]);

  // ✅ Итоговая сумма со скидкой/наценкой
  const finalAmount = useMemo(() => {
    if (!canShowDiscount) return null;

    if (serverCalc?.toAmount) return serverCalc.toAmount;

    const local = baseAmount - baseAmount * (finalPercent / 100);
    return local;
  }, [serverCalc, baseAmount, finalPercent, canShowDiscount]);

  // ✅ Сообщение "Скидка доступна только..."
  const discountMessage = useMemo(() => {
    const isBuy = mode === "buy";

    if (!canShowDiscount) {
      return isBuy
        ? "Скидка доступна только при сумме больше 500 000 тенге"
        : "Наценка доступна только при сумме больше 500 000 тенге";
    }

    if (clientDiscountAvailable === true) {
      return isBuy
        ? "Скидка доступна только на первую бронь или сумму больше 500 000 тенге"
        : "Наценка доступна только на первую бронь или сумму больше 500 000 тенге";
    }

    return isBuy
      ? "Скидка доступна только при сумме больше 500 000 тенге"
      : "Наценка доступна только при сумме больше 500 000 тенге";
  }, [canShowDiscount, clientDiscountAvailable, mode]);

  return {
    canShowDiscount,
    finalPercent,
    finalAmount,
    discountMessage,
    isLoading,
  };
}
