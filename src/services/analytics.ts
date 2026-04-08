import analytics from "@react-native-firebase/analytics";
import { BookingDto } from "../types/api";

type BookingMode = "buy" | "sell";

type BookingCreatedEventContext = {
  booking: BookingDto;
  mode: BookingMode;
  foreignCurrencyCode: string;
  foreignAmount: number;
  kztAmount: number;
};

type BookingCreatedEventParams = {
  booking_id: string;
  booking_type: "fixed_rate" | "floating_rate";
  currency_from: string;
  currency_to: string;
  amount_from: number;
  amount_to: number;
  city: string;
  branch_id: string;
  location: string;
};

const loggedBookingIds = new Set<string>();

function normalizeAmount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

function buildBookingCreatedParams({
  booking,
  mode,
  foreignCurrencyCode,
  foreignAmount,
  kztAmount,
}: BookingCreatedEventContext): BookingCreatedEventParams | null {
  const bookingId = String(booking.id ?? "").trim();
  if (!bookingId) return null;

  const branchId = String(booking.branch?.id ?? "").trim();
  const city = booking.branch?.city?.trim() || "";
  const address = booking.branch?.address?.trim() || "";

  const isSellMode = mode === "sell";

  return {
    booking_id: bookingId,
    booking_type: booking.isRateLocked ? "fixed_rate" : "floating_rate",
    currency_from: isSellMode ? foreignCurrencyCode : "KZT",
    currency_to: isSellMode ? "KZT" : foreignCurrencyCode,
    amount_from: normalizeAmount(isSellMode ? foreignAmount : kztAmount),
    amount_to: normalizeAmount(isSellMode ? kztAmount : foreignAmount),
    city,
    branch_id: branchId,
    location: [city, address].filter(Boolean).join(", "),
  };
}

export async function logBookingCreated(
  context: BookingCreatedEventContext
): Promise<boolean> {
  const params = buildBookingCreatedParams(context);
  if (!params) return false;

  if (loggedBookingIds.has(params.booking_id)) {
    return false;
  }

  try {
    await analytics().logEvent("booking_created", params);
    loggedBookingIds.add(params.booking_id);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to log booking_created", error);
    }

    return false;
  }
}
