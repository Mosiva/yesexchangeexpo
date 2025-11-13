import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import BranchScheduleBlock from "../BranchScheduleBlock";

const ORANGE = "#F58220";

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
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const s = makeStyles(colors);
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
    const safeDecode = (str?: string | null) => {
      if (!str) return "—";

      try {
        str = decodeURIComponent(escape(str));
      } catch {}

      // ✅ Нормализация круглосуточно
      if (/круглосуточно/i.test(str)) {
        return t("branchPickerSheet.open24Hours", "Открыто (24 часа)");
      }

      return str;
    };
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
      shortSchedule = `${t("branchPickerSheet.mondayToSunday", "пн–вс")}: ${
        allDays[0]
      }`;
    }
    // ✅ 2. Если пн–сб одинаковые, а вс другое
    else if (
      allDays.slice(0, 6).every((v) => v === allDays[0]) &&
      allDays[6] !== allDays[0]
    ) {
      const sunday = fullSchedule.Воскресенье;
      if (/выход/i.test(sunday)) {
        shortSchedule = `${t("branchPickerSheet.mondayToSaturday", "пн–сб")}: ${
          allDays[0]
        }, ${t("branchPickerSheet.sunday", "вс")}: ${t(
          "branchPickerSheet.closed",
          "выходной"
        )}`;
      } else {
        shortSchedule = `${t("branchPickerSheet.mondayToSaturday", "пн–сб")}: ${
          allDays[0]
        }, ${t("branchPickerSheet.sunday", "вс")}: ${sunday}`;
      }
    }
    // ✅ 3. Иначе — fallback
    else {
      shortSchedule = `${t("branchPickerSheet.mondayToFriday", "пн–пт")}: ${
        fullSchedule.Понедельник
      }, ${t("branchPickerSheet.saturday", "сб")}: ${fullSchedule.Суббота}, ${t(
        "branchPickerSheet.sunday",
        "вс"
      )}: ${fullSchedule.Воскресенье}`;
    }

    return (
      <Pressable
        style={s.item}
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
        <View style={s.pin}>
          <Image
            source={require("../../../assets/icons/LocationIcon.png")}
            style={{ width: 28, height: 28 }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={s.itemTitle}>
            {safeDecode(
              item.city ??
                item.title ??
                t("branchPickerSheet.noName", "Без названия")
            )}
          </Text>
          <Text style={s.itemAddress} numberOfLines={1}>
            {safeDecode(item.address)}
          </Text>

          <View style={s.row}>
            <Ionicons name="time-outline" size={14} color={colors.subtext} />
            <Text style={s.itemTime}>{shortSchedule}</Text>
          </View>

          {item.distanceKm != null && (
            <Text style={s.itemDistance}>
              {item.distanceKm.toFixed(1)}{" "}
              {t("branchPickerSheet.kmFromYou", "км от вас")}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color="#C7C9CF" />
      </Pressable>
    );
  };

  /** Возвращает текст статуса “Открыто / Закрыто” */
  const getBranchStatusText = (schedule?: Record<string, string>) => {
    if (!schedule) return t("branchPickerSheet.noData", "Нет данных");
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
    if (!todayHours) return t("branchPickerSheet.noData", "Нет данных");

    // безопасная попытка декодировать
    try {
      todayHours = decodeURIComponent(escape(todayHours));
    } catch {
      // если уже нормальная строка — оставляем
    }

    if (
      todayHours === t("branchPickerSheet.open24Hours", "Открыто (24 часа)")
    ) {
      return t("branchPickerSheet.open24Hours", "Открыто (24 часа)");
    }

    const match = todayHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return t("branchPickerSheet.noData", "Нет данных");

    const [_, sh, sm, eh, em] = match.map(Number);
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(sh, sm, 0, 0);
    end.setHours(eh, em, 0, 0);

    if (now >= start && now <= end) {
      return `${t("branchPickerSheet.openUntil", "Открыто до")} ${String(
        eh
      ).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
    } else {
      return `${t("branchPickerSheet.closedUntil", "Закрыто до")} ${String(
        sh
      ).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
    }
  };

  /** Цвет статуса */
  const getBranchStatusColor = (schedule?: Record<string, string>) => {
    const text = getBranchStatusText(schedule);
    if (text.startsWith(t("branchPickerSheet.open", "Открыто")))
      return "#16A34A"; // зелёный
    if (text.startsWith(t("branchPickerSheet.closed", "Закрыто")))
      return "#DC2626"; // красный
    return "#6B7280"; // серый
  };

  const onShare = async () => {
    try {
      const link = selectedBranch?.twoGisLink || "https://yes.exchange/app";

      await Share.share({
        message: `📍 ${safeDecode(selectedBranch?.city ?? "")}, ${safeDecode(
          selectedBranch?.address ?? ""
        )}\n ${t(
          "branchPickerSheet.viewIn2GIS",
          "Посмотреть в 2ГИС"
        )}: ${link}`,
      });
    } catch (e: any) {
      Alert.alert(
        t("branchPickerSheet.shareFailed", "Не удалось поделиться"),
        e?.message ?? ""
      );
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={s.handle}
      backgroundStyle={s.sheetBg}
    >
      <BottomSheetView style={s.content}>
        {!selectedBranch ? (
          <>
            <Text style={s.sheetTitle}>
              {t("branchPickerSheet.selectOffice", "Выберите офис обмена")}
            </Text>

            {/* Поиск */}
            <View style={s.searchBox}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t(
                  "branchPickerSheet.searchByAddress",
                  "Поиск по адресу"
                )}
                style={s.searchInput}
                returnKeyType="search"
              />
            </View>

            {/* Вкладки */}
            <View style={s.tabs}>
              <Pressable
                onPress={() => setTab("nearby")}
                style={[s.tab, tab === "nearby" && s.tabActive]}
              >
                <Text style={[s.tabText, tab === "nearby" && s.tabTextActive]}>
                  {t("branchPickerSheet.nearby", "Рядом")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("all")}
                style={[s.tab, tab === "all" && s.tabActive]}
              >
                <Text style={[s.tabText, tab === "all" && s.tabTextActive]}>
                  {t("branchPickerSheet.allBranches", "Все филиалы")}
                </Text>
              </Pressable>
            </View>

            {/* Список / индикатор */}
            {tab === "nearby" && loadingLocation ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="small" color={ORANGE} />
                <Text style={{ marginTop: 8, color: colors.subtext }}>
                  {t(
                    "branchPickerSheet.determiningLocation",
                    "Определяем местоположение..."
                  )}
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
                    color: colors.subtext,
                    fontSize: 15,
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {tab === "nearby"
                    ? t(
                        "branchPickerSheet.noNearbyBranches",
                        "Нет филиалов поблизости"
                      )
                    : t(
                        "branchPickerSheet.noBranchesFound",
                        "Филиалы не найдены"
                      )}
                </Text>
              </View>
            ) : (
              <BottomSheetFlatList
                data={dataToShow}
                keyExtractor={(b) => String(b.id)}
                renderItem={renderBranchItem}
                ItemSeparatorComponent={() => <View style={s.sep} />}
                contentContainerStyle={{ paddingBottom: 170 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        ) : (
          <View style={{ flex: 1, marginBottom: 30 }}>
            {/* --- ДЕТАЛИ ФИЛИАЛА --- */}
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>
                  {safeDecode(
                    selectedBranch.city ??
                      selectedBranch.title ??
                      t("branchPickerSheet.branch", "Филиал")
                  )}
                </Text>
                <Text style={s.address}>
                  {safeDecode(selectedBranch.address)}
                </Text>
              </View>
              <Pressable onPress={onCloseDetails}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Галерея */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.galleryRow}
            >
              {(selectedBranch.photos ?? []).map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={s.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Время работы */}
            <Text style={s.workLabel}>
              {t("branchPickerSheet.workTimeToday", "Время работы сегодня")}
            </Text>
            <Text
              style={[
                s.workNow,
                { color: getBranchStatusColor(selectedBranch.schedule) },
              ]}
            >
              {getBranchStatusText(selectedBranch.schedule)}
            </Text>

            {/* График */}
            <Text style={s.workLabel}>
              {t("branchPickerSheet.schedule", "График")}
            </Text>

            {selectedBranch.schedule && (
              <BranchScheduleBlock schedule={selectedBranch.schedule} />
            )}

            {/* Контакты */}
            {selectedBranch.contactPhone && (
              <>
                <Text style={s.workLabel}>
                  {t("branchPickerSheet.contacts", "Контакты")}
                </Text>
                <View style={s.contactRow}>
                  <Ionicons name="call" size={18} color={ORANGE} />
                  <Text style={s.contactText}>
                    {selectedBranch.contactPhone}
                  </Text>
                </View>
                <View style={s.contactRow}>
                  <Ionicons name="mail" size={18} color={ORANGE} />
                  <Text style={s.contactText}>{selectedBranch.email}</Text>
                </View>
              </>
            )}

            {isNearbyScreen ? (
              <TouchableOpacity style={s.shareRow} onPress={onShare}>
                <Ionicons
                  name="share-social-outline"
                  size={22}
                  color="#9CA3AF"
                />
                <Text style={s.shareText}>
                  {t("branchPickerSheet.share", "Поделиться")}
                </Text>
              </TouchableOpacity>
            ) : (
              <Pressable
                style={s.cta}
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
                <Text style={s.ctaText}>
                  {isRateLocked
                    ? t(
                        "branchPickerSheet.bookByRate",
                        "Забронировать по курсу"
                      )
                    : t("branchPickerSheet.bookHere", "Забронировать тут")}
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
const makeStyles = (colors: any) =>
  StyleSheet.create({
    sheetBg: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    handle: {
      width: 60,
      height: 4,
      backgroundColor: "#E9ECEF",
      borderRadius: 2,
    },
    content: { flex: 1, padding: 16 },
    sheetTitle: {
      color: colors.text,
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
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    tabs: { flexDirection: "row", gap: 12, marginBottom: 10 },
    tab: {
      flex: 1,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: { backgroundColor: colors.active },
    tabText: { color: colors.subtext, fontSize: 16, fontWeight: "700" },
    tabTextActive: { color: colors.text },
    item: { flexDirection: "row", alignItems: "center", paddingVertical: 7 },
    pin: {
      marginRight: 10,
    },
    itemTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
    itemAddress: { color: colors.subtext, marginTop: 4 },
    itemDistance: { color: colors.subtext, fontSize: 13, marginTop: 2 },
    sep: { height: 1, backgroundColor: colors.border },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    title: { fontSize: 20, fontWeight: "800", color: colors.text },
    address: { color: colors.subtext, marginTop: 4 },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    },
    workLabel: {
      color: colors.subtext,
      fontSize: 14,
      marginTop: 12,
      marginBottom: 4,
    },
    contactText: { color: colors.text, fontSize: 16 },
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
    day: { fontWeight: "700", color: colors.text },
    hours: { color: colors.text },
    row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    itemTime: { color: colors.subtext },
    shareRow: {
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
    },
    shareText: { color: colors.subtext, fontSize: 14, fontWeight: "700" },
  });
