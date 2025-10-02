import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { clientApi } from "services";

const { useGetClientQuery } = clientApi;

export default function ReserveScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { refetch: refetchClient, isLoading: isClientLoading } =
    useGetClientQuery({});

  useFocusEffect(
    useCallback(() => {
      refetchClient();
    }, [refetchClient])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchClient();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isClientLoading}
          onRefresh={onRefresh}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" />

      {/* Top tiles */}
      <View style={styles.tilesRow}>
        <Tile
          title={"Без привязки\nк курсу"}
          Icon={<FontAwesome6 name="money-bills" size={24} color={ORANGE} />}
          onPress={() => router.push("/(stacks)/norates")}
        />
        <Tile
          title={"С привязкой\nк курсу"}
          sub="Бронь до 30 минут"
          Icon={<MaterialIcons name="analytics" size={24} color={ORANGE} />}
          // onPress={() => router.push("/(reserve)/withrate")}
        />
      </View>

      {/* Gold reservation */}
      <Pressable
        style={styles.wideCard}
        // onPress={() => router.push("/(reserve)/gold")}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconBadge]}>
            <MaterialCommunityIcons name="gold" size={24} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.wideTitle}>Бронирование золота</Text>
            <Text style={styles.wideSub}>Золотые слитки НБ РК</Text>
          </View>
        </View>
      </Pressable>

      {/* History row */}
      <Pressable
        style={styles.historyRow}
        // onPress={() => router.push("/(reserve)/history")}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconBadge]}>
            <MaterialCommunityIcons name="history" size={24} color="#F58220" />
          </View>
          <Text style={styles.historyText}>История бронирования</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>
    </ScrollView>
  );
}

/* -------------------- UI bits -------------------- */

function Tile({
  title,
  sub,
  Icon,
  onPress,
}: {
  title: string;
  sub?: string;
  Icon: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={[styles.iconBadge]}>{Icon}</View>
      <Text style={styles.tileTitle}>{title}</Text>
      {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
    </Pressable>
  );
}

/* -------------------- styles -------------------- */

const ORANGE = "#F58220";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
    marginBottom: 12,
  },

  tilesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 16,
    minHeight: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    fontSize: 14,
    lineHeight: 26,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  tileSub: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
  },

  wideCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  wideTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  wideSub: { fontSize: 12, color: "#6B7280", marginTop: 2, fontWeight: "400" },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9EDF2",
    paddingHorizontal: 14,
    paddingVertical: 18,
    marginTop: 14,
  },
  historyText: { fontSize: 14, fontWeight: "600", color: "#111827" },
});
