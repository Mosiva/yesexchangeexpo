// components/UploadResume.tsx
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  value: any | null; // { uri, name, type }
  onChange: (file: any | null) => void;
}

export default function UploadResume({ value, onChange }: Props) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [loading, setLoading] = useState(false);

  const MAX_SIZE_MB = 5; // максимум 5MB

  const pickFile = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];

        // --- Валидация размера файла ---
        const sizeMb = file.size ? file.size / 1024 / 1024 : 0;
        if (sizeMb > MAX_SIZE_MB) {
          Alert.alert(
            "Файл слишком большой",
            `Максимальный размер — ${MAX_SIZE_MB} МБ`
          );
          setLoading(false);
          return;
        }

        onChange({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
          size: file.size,
        });
      }
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось выбрать файл");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    onChange(null);
  };

  return (
    <View style={{ marginTop: 12 }}>
      {/* Кнопка выбора файла */}
      <TouchableOpacity style={s.attach} onPress={pickFile} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <>
            <Ionicons name="attach-outline" size={22} color={colors.text} />
            <Text style={s.attachText}>
              {value?.name ? "Заменить файл" : "Прикрепить резюме"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* --- Превью выбранного файла --- */}
      {value && (
        <View style={s.preview}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={colors.text}
          />
          <Text style={s.fileName} numberOfLines={1}>
            {value.name}
          </Text>

          {/* удалить */}
          <TouchableOpacity onPress={removeFile} hitSlop={8}>
            <Ionicons name="close-circle" size={24} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    attach: {
      backgroundColor: colors.card,
      borderColor: colors.subtext + "33",
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    attachText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "600",
    },
    preview: {
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderColor: colors.subtext + "33",
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    fileName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
  });
