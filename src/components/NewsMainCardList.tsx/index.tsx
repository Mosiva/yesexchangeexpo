// components/NewsMainCardList.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type NewsItem = {
  id: string | number;
  title: string;
  summary?: string;
  date: string | Date;
};

type Props = {
  items: NewsItem[];
  initial?: number; // по умолчанию 3
  onItemPress?: (item: NewsItem) => void; // если передан, используем кастомный хэндлер
  onMorePress?: () => void; // вызывается при разворачивании
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function NewsMainCardList({
  items,
  initial = 3,
  onItemPress,
  onMorePress,
  onDark = true,
  style,
}: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const c = useMemo(() => palette(onDark), [onDark]);

  const visible = expanded ? items : items.slice(0, initial);
  const hasMore = items.length > initial;
  const buttonLabel = expanded ? "Скрыть" : "Показать больше";

  return (
    <View style={[styles.wrapper, style]}>
      {visible.map((it, idx) => (
        <View key={String(it.id)}>
          <Pressable
            android_ripple={{
              color: onDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            }}
            style={styles.card}
            // onPress={() => {
            //   if (onItemPress) {
            //     onItemPress(it);
            //   } else {
            //     // 🔗 переход на карточку новости
            //     router.push({
            //       pathname: "/news/[id]",
            //       params: {
            //         id: String(it.id),
            //         title: it.title,
            //         date: String(it.date),
            //         content: it.summary ?? "", // можно заменить на полный текст, если есть
            //       },
            //     });
            //   }
            // }}
          >
            <Text style={[styles.title, c.title]} numberOfLines={2}>
              {it.title}
            </Text>

            {!!it.summary && (
              <Text style={[styles.summary, c.summary]} numberOfLines={2}>
                {it.summary}
              </Text>
            )}

            <Text style={[styles.date, c.date]}>{formatDateRU(it.date)}</Text>
          </Pressable>

          {idx !== visible.length - 1 && (
            <View style={[styles.divider, c.divider]} />
          )}
        </View>
      ))}

      {hasMore && (
        <Pressable
          // onPress={() => router.push("/(stacks)/news")}
          style={styles.moreBtn}
          android_ripple={{
            color: onDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            borderless: true,
          }}
        >
          <Text style={[styles.moreText, c.more]}>{buttonLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- helpers ---------- */

function formatDateRU(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return String(d);
  return date
    .toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\u00A0/g, " ");
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    fontWeight: "400",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  moreBtn: {
    alignItems: "center",
    paddingVertical: 16,
  },
  moreText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

/* palettes for light / dark backgrounds */
function palette(onDark: boolean) {
  return {
    title: { color: onDark ? "rgba(255,255,255,0.92)" : "#111827" },
    summary: { color: onDark ? "rgba(255,255,255,0.75)" : "#4B5563" },
    date: { color: onDark ? "rgba(255,255,255,0.65)" : "#6B7280" },
    divider: {
      backgroundColor: onDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)",
    },
    more: { color: onDark ? "rgba(255,255,255,0.85)" : "#727376" },
  };
}
