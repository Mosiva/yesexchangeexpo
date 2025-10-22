import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const ORANGE = "#F58220";
const TEXT = "#111827";
const SUB = "#6B7280";
const BORDER = "#ECECEC";

/** Тип филиала */
export type Branch = {
  id: string | number;
  city?: string;
  title?: string;
  address: string;
  lat: string | number;
  lng: string | number;
  contactPhone?: string | null;
  worktimeToday?: string;
  schedule?: { [key: string]: string };
  phone?: string;
  email?: string;
  distanceKm?: number | null;
  photos?: string[];
  twoGisLink?: string;
};

/** Пропсы компонента */
type Props = {
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  onCloseDetails: () => void;
  allBranches?: Branch[];
  nearbyBranches?: Branch[];
  loadingLocation?: boolean;
  isRateLocked?: boolean;
  isNearbyScreen?: boolean;
};
export default function BranchPickerSheet({
  selectedBranch,
  onSelectBranch,
  onCloseDetails,
  allBranches = [],
  nearbyBranches = [],
  loadingLocation = false,
  isRateLocked = false,
  isNearbyScreen = false,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "85%"], []);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"nearby" | "all">("nearby");

  // безопасное декодирование строк
  const safeDecode = (str?: string | null) => {
    if (!str) return "—";
    try {
      return decodeURIComponent(escape(str));
    } catch {
      return str;
    }
  };

  // 🔎 Фильтрация
  const filteredAll = useMemo(() => {
    if (!query.trim()) return allBranches;
    return allBranches.filter((b) =>
      `${safeDecode(b.city) ?? ""} ${safeDecode(b.address) ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, allBranches]);

  const dataToShow = tab === "nearby" ? nearbyBranches : filteredAll;

  const renderBranchItem = ({ item }: { item: Branch }) => {
    const fullSchedule = {
      Понедельник: safeDecode(item.schedule?.[0]),
      Вторник: safeDecode(item.schedule?.[1]),
      Среда: safeDecode(item.schedule?.[2]),
      Четверг: safeDecode(item.schedule?.[3]),
      Пятница: safeDecode(item.schedule?.[4]),
      Суббота: safeDecode(item.schedule?.[5]),
      Воскресенье: safeDecode(item.schedule?.[6]),
    };

    const allDays = Object.values(fullSchedule);

    let shortSchedule = "—";

    // ✅ 1. Если все дни одинаковые
    if (allDays.every((v) => v === allDays[0])) {
      shortSchedule = `пн–вс: ${allDays[0]}`;
    }
    // ✅ 2. Если пн–сб одинаковые, а вс другое
    else if (
      allDays.slice(0, 6).every((v) => v === allDays[0]) &&
      allDays[6] !== allDays[0]
    ) {
      const sunday = fullSchedule.Воскресенье;
      if (/выход/i.test(sunday)) {
        shortSchedule = `пн–сб: ${allDays[0]}, вс: выходной`;
      } else {
        shortSchedule = `пн–сб: ${allDays[0]}, вс: ${sunday}`;
      }
    }
    // ✅ 3. Иначе — fallback
    else {
      shortSchedule = `пн–пт: ${fullSchedule.Понедельник}, сб: ${fullSchedule.Суббота}, вс: ${fullSchedule.Воскресенье}`;
    }

    return (
      <Pressable
        style={styles.item}
        onPress={() =>
          onSelectBranch({
            ...item,
            worktimeToday: fullSchedule.Понедельник,
            schedule: fullSchedule,
            email: item.email,
            photos: item.photos,
          })
        }
      >
        <View style={styles.pin}>
          <Image
            source={require("../../../assets/icons/LocationIcon.png")}
            style={{ width: 28, height: 28 }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>
            {safeDecode(item.city ?? item.title ?? "Без названия")}
          </Text>
          <Text style={styles.itemAddress} numberOfLines={1}>
            {safeDecode(item.address)}
          </Text>

          <View style={styles.row}>
            <Ionicons name="time-outline" size={14} color={SUB} />
            <Text style={styles.itemTime}>{shortSchedule}</Text>
          </View>

          {item.distanceKm != null && (
            <Text style={styles.itemDistance}>
              {item.distanceKm.toFixed(1)} км от вас
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color="#C7C9CF" />
      </Pressable>
    );
  };

  /** Возвращает текст статуса “Открыто / Закрыто” */
  const getBranchStatusText = (schedule?: Record<string, string>) => {
    if (!schedule) return "Нет данных";
    const now = new Date();
    const weekday = now.getDay(); // 0 = воскресенье, 1 = понедельник, ...
    const days = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    const todayKey = days[weekday];

    let todayHours = schedule[todayKey];
    if (!todayHours) return "Нет данных";

    // безопасная попытка декодировать
    try {
      todayHours = decodeURIComponent(escape(todayHours));
    } catch {
      // если уже нормальная строка — оставляем
    }

    if (/круглосуточно/i.test(todayHours)) return "Открыто (24 часа)";

    const match = todayHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return "Нет данных";

    const [_, sh, sm, eh, em] = match.map(Number);
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(sh, sm, 0, 0);
    end.setHours(eh, em, 0, 0);

    if (now >= start && now <= end) {
      return `Открыто до ${String(eh).padStart(2, "0")}:${String(em).padStart(
        2,
        "0"
      )}`;
    } else {
      return `Закрыто до ${String(sh).padStart(2, "0")}:${String(sm).padStart(
        2,
        "0"
      )}`;
    }
  };

  /** Цвет статуса */
  const getBranchStatusColor = (schedule?: Record<string, string>) => {
    const text = getBranchStatusText(schedule);
    if (text.startsWith("Открыто")) return "#16A34A"; // зелёный
    if (text.startsWith("Закрыто")) return "#DC2626"; // красный
    return "#6B7280"; // серый
  };

  const onShare = async () => {
    try {
      const link = selectedBranch?.twoGisLink || "https://yes.exchange/app";

      await Share.share({
        message: `📍 ${safeDecode(selectedBranch?.city ?? "")}, ${safeDecode(
          selectedBranch?.address ?? ""
        )}\nПосмотреть в 2ГИС: ${link}`,
      });
    } catch (e: any) {
      Alert.alert("Не удалось поделиться", e?.message ?? "");
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.content}>
        {!selectedBranch ? (
          <>
            <Text style={styles.sheetTitle}>Выберите офис обмена</Text>

            {/* Поиск */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Поиск по адресу"
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>

            {/* Вкладки */}
            <View style={styles.tabs}>
              <Pressable
                onPress={() => setTab("nearby")}
                style={[styles.tab, tab === "nearby" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "nearby" && styles.tabTextActive,
                  ]}
                >
                  Рядом
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("all")}
                style={[styles.tab, tab === "all" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "all" && styles.tabTextActive,
                  ]}
                >
                  Все филиалы
                </Text>
              </Pressable>
            </View>

            {/* Список / индикатор */}
            {tab === "nearby" && loadingLocation ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="small" color={ORANGE} />
                <Text style={{ marginTop: 8, color: SUB }}>
                  Определяем местоположение...
                </Text>
              </View>
            ) : dataToShow.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <Image
                  source={require("../../../assets/icons/LocationIcon.png")}
                  style={{ width: 32, height: 32 }}
                />
                <Text
                  style={{
                    marginTop: 12,
                    color: SUB,
                    fontSize: 15,
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {tab === "nearby"
                    ? "Нет филиалов поблизости"
                    : "Филиалы не найдены"}
                </Text>
              </View>
            ) : (
              <BottomSheetFlatList
                data={dataToShow}
                keyExtractor={(b) => String(b.id)}
                renderItem={renderBranchItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 170}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
           
              />
            )}
          </>
        ) : (
          <View style={{ flex: 1, marginBottom: 30 }}>
            {/* --- ДЕТАЛИ ФИЛИАЛА --- */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {safeDecode(
                    selectedBranch.city ?? selectedBranch.title ?? "Филиал"
                  )}
                </Text>
                <Text style={styles.address}>
                  {safeDecode(selectedBranch.address)}
                </Text>
              </View>
              <Pressable onPress={onCloseDetails}>
                <Ionicons name="close" size={22} color={TEXT} />
              </Pressable>
            </View>

            {/* Галерея */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galleryRow}
            >
              {(selectedBranch.photos ?? []).map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Время работы */}
            <Text style={styles.workLabel}>Время работы сегодня</Text>
            <Text
              style={[
                styles.workNow,
                { color: getBranchStatusColor(selectedBranch.schedule) },
              ]}
            >
              {getBranchStatusText(selectedBranch.schedule)}
            </Text>

            {/* График */}
            <Text style={styles.workLabel}>График</Text>
            {selectedBranch.schedule &&
              (() => {
                const daysOrder = [
                  "Понедельник",
                  "Вторник",
                  "Среда",
                  "Четверг",
                  "Пятница",
                  "Суббота",
                  "Воскресенье",
                ];

                // преобразуем в массив [день, часы]
                const entries = daysOrder.map((day) => [
                  day,
                  selectedBranch.schedule?.[day] ?? "—",
                ]);

                // сгруппировать одинаковые часы
                const groups: { days: string[]; hours: string }[] = [];
                for (const [day, hours] of entries) {
                  const last = groups[groups.length - 1];
                  if (last && last.hours === hours) {
                    last.days.push(day);
                  } else {
                    groups.push({ days: [day], hours });
                  }
                }

                // сокращения для дней
                const shortDay = (day: string) =>
                  ({
                    Понедельник: "пн",
                    Вторник: "вт",
                    Среда: "ср",
                    Четверг: "чт",
                    Пятница: "пт",
                    Суббота: "сб",
                    Воскресенье: "вс",
                  }[day] || day);

                return groups.map((g, idx) => {
                  const range =
                    g.days.length > 1
                      ? `${shortDay(g.days[0])}–${shortDay(
                          g.days[g.days.length - 1]
                        )}`
                      : shortDay(g.days[0]);
                  return (
                    <View style={styles.scheduleRow} key={idx}>
                      <Text style={styles.day}>{range}</Text>
                      <Text style={styles.hours}>{g.hours}</Text>
                    </View>
                  );
                });
              })()}

            {/* Контакты */}
            {selectedBranch.contactPhone && (
              <>
                <Text style={styles.workLabel}>Контакты</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={18} color={ORANGE} />
                  <Text style={styles.contactText}>
                    {selectedBranch.contactPhone}
                  </Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="mail" size={18} color={ORANGE} />
                  <Text style={styles.contactText}>{selectedBranch.email}</Text>
                </View>
              </>
            )}

            {isNearbyScreen ? (
              <TouchableOpacity style={styles.shareRow} onPress={onShare}>
                <Ionicons
                  name="share-social-outline"
                  size={22}
                  color="#9CA3AF"
                />
                <Text style={styles.shareText}>Поделиться</Text>
              </TouchableOpacity>
            ) : (
              <Pressable
                style={styles.cta}
                onPress={() =>
                  router.push({
                    pathname: isRateLocked
                      ? "/(stacks)/norates/withrates"
                      : "/(stacks)/norates",
                    params: {
                      id: selectedBranch.id,
                      address: selectedBranch.address,
                      city: selectedBranch.city,
                    },
                  })
                }
              >
                <Text style={styles.ctaText}>
                  {isRateLocked
                    ? "Забронировать по курсу"
                    : "Забронировать тут"}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

/* 💅 Стили */
const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: { width: 60, height: 4, backgroundColor: "#E9ECEF", borderRadius: 2 },
  content: { flex: 1, padding: 16 },
  sheetTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: TEXT },
  tabs: { flexDirection: "row", gap: 12, marginBottom: 10 },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F6F8",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#F0F1F3" },
  tabText: { color: SUB, fontSize: 16, fontWeight: "700" },
  tabTextActive: { color: TEXT },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 7 },
  pin: {
    marginRight: 10,
  },
  itemTitle: { color: TEXT, fontSize: 18, fontWeight: "800" },
  itemAddress: { color: SUB, marginTop: 4 },
  itemDistance: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  sep: { height: 1, backgroundColor: BORDER },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: TEXT },
  address: { color: SUB, marginTop: 4 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  workLabel: { color: SUB, fontSize: 14, marginTop: 12, marginBottom: 4 },
  contactText: { color: TEXT, fontSize: 16 },
  cta: {
    marginTop: 20,
    backgroundColor: ORANGE,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  galleryRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  workNow: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  scheduleRow: { flexDirection: "row", justifyContent: "space-between" },
  day: { fontWeight: "700", color: TEXT },
  hours: { color: TEXT },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  itemTime: { color: SUB },
  shareRow: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  shareText: { color: "#6B7280", fontSize: 14, fontWeight: "700" },
});
