import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { clientApi } from "services";

const { useGetClientQuery } = clientApi;

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // get current profile to prefill
  const { data: rawClient } = useGetClientQuery({});
  const client: any = (rawClient as any)?.data ?? rawClient ?? null;

  // helpers
  const initialDigits = useMemo(() => {
    const p = (client?.phone as string | undefined)?.replace(/\D/g, "") || "";
    // expect +7XXXXXXXXXX → keep national 10 digits
    return p.startsWith("7") ? p.slice(1, 11) : p.slice(0, 10);
  }, [client]);

  const [firstName, setFirstName] = useState(client?.firstName ?? "");
  const [lastName, setLastName] = useState(client?.lastName ?? "");
  const [digits, setDigits] = useState(initialDigits);
  const [maskedPhone, setMaskedPhone] = useState(""); // MaskInput will compute on first render

  const isPhoneValid = digits.length === 10;
  const isValid = firstName.trim().length > 0 && isPhoneValid;

  const handleSave = async () => {
    try {
      // TODO: call your update API here
      // await updateProfile({ firstName, lastName, phone: `+7${digits}` }).unwrap();
      Alert.alert("Готово", "Данные сохранены");
      router.back();
    } catch (e: any) {
      Alert.alert("Ошибка", e?.data?.message || "Не удалось сохранить");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* First name */}
      <Field label="Ваше имя">
        <TextInput
          style={styles.fieldInput}
          placeholder="Азамат"
          value={firstName}
          onChangeText={setFirstName}
          returnKeyType="next"
        />
      </Field>

      {/* Last name */}
      <Field label="Ваша фамилия" topGap={14}>
        <TextInput
          style={styles.fieldInput}
          placeholder="Жунумбеков"
          value={lastName}
          onChangeText={setLastName}
          returnKeyType="next"
        />
      </Field>

      {/* Phone */}
      <Field label="Номер телефона" topGap={14}>
        <MaskInput
          style={styles.fieldInput}
          placeholder="+7 707 777-77-77"
          keyboardType="number-pad"
          inputMode="numeric"
          mask={[
            "+",
            "7",
            " ",
            /\d/,
            /\d/,
            /\d/,
            " ",
            /\d/,
            /\d/,
            /\d/,
            "-",
            /\d/,
            /\d/,
            "-",
            /\d/,
            /\d/,
          ]}
          value={maskedPhone}
          onChangeText={(masked, unmasked) => {
            const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
            setDigits(next);
            setMaskedPhone(masked);
          }}
          // initialize mask text on first render
          onLayout={() => {
            if (!maskedPhone && initialDigits) {
              // create initial masked string via tiny hack:
              const raw = `+7${initialDigits}`;
              const formatted = `+7 ${initialDigits.slice(
                0,
                3
              )} ${initialDigits.slice(3, 6)}-${initialDigits.slice(
                6,
                8
              )}-${initialDigits.slice(8, 10)}`;
              setMaskedPhone(formatted.length === 16 ? formatted : raw);
            }
          }}
        />
      </Field>

      <TouchableOpacity
        style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
        disabled={!isValid}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>Сохранить изменения</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/** Orange floating-label field like the mock */
function Field({
  label,
  children,
  topGap = 0,
}: {
  label: string;
  children: React.ReactNode;
  topGap?: number;
}) {
  return (
    <View style={{ marginTop: topGap }}>
      <View style={styles.fieldWrap}>
        <View style={styles.fieldLabelBadge}>
          <Text style={styles.fieldLabelText}>{label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

const COLORS = {
  orange: "#F58220",
  text: "#111827",
  subtext: "#6B7280",
  border: "#F58220",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.bg,
    flexGrow: 1,
  },

  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 24,
  },

  // Field with floating label
  fieldWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    position: "relative",
  },
  fieldLabelBadge: {
    position: "absolute",
    left: 16,
    top: -12,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
  },
  fieldLabelText: {
    color: COLORS.orange,
    fontSize: 14,
    fontWeight: "400",
  },
  fieldInput: {
    fontSize: 16,
    color: COLORS.text,
  },

  saveBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
