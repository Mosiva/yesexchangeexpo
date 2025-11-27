import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import { clientApi } from "services";
import { z } from "zod";
import { useTheme } from "../../../../hooks/useTheme";
import { useUpdateMeMutation } from "../../../../services/yesExchange";

const { useGetClientQuery } = clientApi;

// ---- Schema ----
const schema = z.object({
  firstName: z.string().trim().min(1, "Укажите имя"),
  lastName: z.string().trim().optional(),
  digits: z.string().regex(/^\d{10}$/, "Введите номер из 10 цифр"),
});

type FormValues = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const s = makeStyles(colors);
  const { t } = useTranslation();
  const router = useRouter();

  const { data: rawClient, isLoading } = useGetClientQuery({});
  const client: any = (rawClient as any)?.data ?? rawClient ?? null;

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      digits: "",
    },
  });

  // Заполняем при загрузке
  useEffect(() => {
    if (client) {
      const d = (client.phone as string | undefined)?.replace(/\D/g, "") ?? "";
      const ten = d.startsWith("7") ? d.slice(1) : d;
      reset({
        firstName: client.firstName ?? "",
        lastName: client.lastName ?? "",
        digits: ten,
      });
    }
  }, [client, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateMe({
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        phone: `+7${values.digits}`,
        residentRK: client?.residentRK ?? false,
        role: client?.role ?? undefined,
      }).unwrap();

      Alert.alert(
        t("profile.success", "Готово"),
        t("profile.successMessage", "Данные сохранены")
      );
      router.back();
    } catch (err: any) {
      Alert.alert(
        t("common.error", "Ошибка"),
        err?.data?.message || t("common.errorMessage", "Не удалось сохранить")
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle={isLight ? "dark-content" : "light-content"}
        backgroundColor={colors.background}
      />
      {/* First name */}
      <Controller
        control={control}
        name="firstName"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field label={t("profile.yourname", "Ваше имя")}>
            <TextInput
              style={s.fieldInput}
              placeholder="Азамат"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.firstName && (
              <Text style={s.error}>{errors.firstName.message}</Text>
            )}
          </Field>
        )}
      />

      {/* Last name */}
      <Controller
        control={control}
        name="lastName"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field
            label={t("profile.yoursecondname", "Ваша фамилия")}
            topGap={14}
          >
            <TextInput
              style={s.fieldInput}
              placeholder="Жунумбеков"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </Field>
        )}
      />

      {/* Phone */}
      <Controller
        control={control}
        name="digits"
        render={({ field: { value, onChange } }) => (
          <Field label={t("profile.phone", "Номер телефона")} topGap={14}>
            <MaskInput
              style={s.fieldInput}
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
              value={value ? `+7${value}` : ""}
              onChangeText={(masked, unmasked) => {
                const next = (unmasked || "").replace(/\D/g, "").slice(0, 10);
                onChange(next);
              }}
              maxLength={16}
            />
            {errors.digits && (
              <Text style={s.error}>{errors.digits.message}</Text>
            )}
          </Field>
        )}
      />

      <TouchableOpacity
        style={[s.saveBtn, (isSubmitting || isUpdating) && s.saveBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || isUpdating}
      >
        <Text style={s.saveBtnText}>
          {isSubmitting || isUpdating
            ? t("profile.saving", "Сохраняем...")
            : t("profile.saveChanges", "Сохранить изменения")}
        </Text>
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
  const { colors } = useTheme();
  const s = makeStyles(colors);
  return (
    <View style={{ marginTop: topGap }}>
      <View style={s.fieldWrap}>
        <View style={s.fieldLabelBadge}>
          <Text style={s.fieldLabelText}>{label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    fieldWrap: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 16,
      paddingTop: 18,
      paddingBottom: 14,
      paddingHorizontal: 16,
      position: "relative",
      marginBottom: 8,
    },
    fieldLabelBadge: {
      position: "absolute",
      left: 16,
      top: -12,
      backgroundColor: colors.background,
      paddingHorizontal: 10,
    },
    fieldLabelText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "400",
    },
    fieldInput: {
      fontSize: 16,
      color: colors.text,
    },
    saveBtn: {
      backgroundColor: colors.primary,
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
      fontSize: 16,
      fontWeight: "700",
    },
    error: { color: "red", fontSize: 13, marginTop: 4 },
  });
