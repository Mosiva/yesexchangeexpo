import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ORANGE = "#F58220";

export default function SettingsScreen() {
  const router = useRouter();
  const version = "1.0.1";

  const onShare = async () => {
    try {
      await Share.share({
        message:
          "Yes Exchange — удобный обмен валют. Скачай приложение: https://yes.exchange/app",
      });
    } catch (e: any) {
      Alert.alert("Не удалось поделиться", e?.message ?? "");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Rows */}
        <ListItem icon="settings-outline" label="Настройки" />
        <ListItem
          icon="chatbox-ellipses-outline"
          label="Отзывы и предложения"
        />
        <ListItem
          icon="newspaper-outline"
          label="О компании"
          onPress={() => router.push("/(stacks)/settings/aboutus")}
        />

        {/* CTA */}
        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Хочу к вам в команду!</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.shareRow} onPress={onShare}>
          <Ionicons name="share-social-outline" size={22} color="#9CA3AF" />
          <Text style={styles.shareText}>Поделиться приложением</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Версия приложения {version}</Text>
      </ScrollView>
    </View>
  );
}

function ListItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeftIconWrap}>
        <Ionicons name={icon} size={22} color={ORANGE} />
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={24} color="#414142" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 14,
  },
  cardLeftIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardLabel: { flex: 1, fontSize: 14, color: "#111827", fontWeight: "400" },

  cta: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  shareRow: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  shareText: { color: "#6B7280", fontSize: 14, fontWeight: "700" },

  version: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 32,
    fontSize: 14,
  },
});
