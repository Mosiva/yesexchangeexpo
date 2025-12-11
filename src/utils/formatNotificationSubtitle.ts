import { TFunction } from "i18next";

export type NotifPrefs = {
  rates: boolean;
  finance: boolean;
  yesNews: boolean;
};

export function formatNotificationSubtitle(
  prefs: NotifPrefs,
  t: TFunction
): string {
  const labels: string[] = [];

  if (prefs.rates) labels.push(t("notifications.rates", "Курсы валют"));
  if (prefs.finance)
    labels.push(t("notifications.finance", "Финансовые новости"));
  if (prefs.yesNews) labels.push("YesNews");

  return labels.length > 0
    ? labels.join(", ")
    : "";
}
