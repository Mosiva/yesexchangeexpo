import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  schedule: Record<string, string>;
}

export default function BranchScheduleBlock({ schedule }: Props) {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const s = makeStyles(colors);
  // ✅ Берем сокращения дней недели из i18n
  const daysShort = t("datepicker.days", { returnObjects: true }) as string[];

  // ✅ Мап длинных названий → короткие
  const dayMap: Record<string, string> = {
    Понедельник: daysShort[1],
    Вторник: daysShort[2],
    Среда: daysShort[3],
    Четверг: daysShort[4],
    Пятница: daysShort[5],
    Суббота: daysShort[6],
    Воскресенье: daysShort[0],
  };

  // ✅ Порядок дней в неделе
  const daysOrder = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  // ✅ Преобразуем расписание в [день, часы]
  const entries = daysOrder.map((day) => [day, schedule?.[day] ?? "—"]) as [
    string,
    string
  ][];

  // ✅ Группируем подряд идущие дни с одинаковыми часами
  const groups: { days: string[]; hours: string }[] = [];
  for (const [day, hours] of entries) {
    const last = groups[groups.length - 1];
    if (last && last.hours === hours) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], hours });
    }
  }

  const shortDay = (longDay: string) => dayMap[longDay] ?? longDay;

  return (
    <View style={{ marginTop: 4 }}>
      {groups.map((g, idx) => {
        const range =
          g.days.length > 1
            ? `${shortDay(g.days[0])}–${shortDay(g.days[g.days.length - 1])}`
            : shortDay(g.days[0]);

        return (
          <View style={s.row} key={idx}>
            <Text style={s.day}>{range}</Text>
            <Text style={s.hours}>{g.hours}</Text>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  day: {
    fontWeight: "700",
    color: colors.text,
  },
  hours: {
    color: colors.text,
  },
});
