import { Loader } from "components";
import { Formik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { clientApi } from "services";
import * as yup from "yup";

const { useGetClientQuery, useUpdateClientMutation } = clientApi;

export const EditUserCabinetScreen = () => {
  const {
    data: client,
    isLoading: isClientLoading,
    error: clientError,
  } = useGetClientQuery({});
  const [updateClient, { isLoading: isUpdateLoading }] =
    useUpdateClientMutation();
  const { t } = useTranslation();

  const validationSchema = yup.object().shape({
    email: yup.string().required(t("application.required")),
    first_name: yup.string().required(t("application.required")),
    last_name: yup.string().required(t("application.required")),
    phone: yup.string(),
  });

  const initialValues = {
    email: client?.data?.email || "",
    first_name: client?.data?.first_name || "",
    last_name: client?.data?.last_name || "",
    phone: client?.data?.phone || "",
  };

  const handleNext = async (values, actions) => {
    // Remove all non-digit characters
    const cleanPhone = values.phone.replace(/\D/g, "");

    try {
      await updateClient({
        id: client.data.id,
        ...values,
        phone: cleanPhone,
      }).unwrap();
      Toast.show({
        type: "success",
        text1: t("edituser.success"),
        text2: t("edituser.successDetails"),
      });
    } catch (submitError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: submitError.message || "Something went wrong!",
      });
      actions.setSubmitting(false);
    }
  };

  if (isClientLoading) return <Loader />;
  if (clientError) return <Text>{t("common.somethingWentWrong")}</Text>;

  // Phone formatter helper
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("7") && digits.length >= 11) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
        7,
        9
      )}-${digits.slice(9, 11)}`;
    } else if (digits.startsWith("8") && digits.length >= 11) {
      return `8${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(
        7,
        9
      )}-${digits.slice(9, 11)}`;
    }
    return value;
  };

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={handleNext}
      enableReinitialize
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        values,
        errors,
        touched,
      }) => (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <Text style={styles.sectionHeader}>
                {t("mainpass.useraccountinfo")}
              </Text>
              <TextInput
                placeholder="Email"
                value={values.email}
                editable={false}
                style={[styles.input, styles.disabledInput]}
              />
              <TextInput
                placeholder="Номер телефона"
                value={formatPhone(values.phone)}
                onChangeText={(text) => {
                  const raw = text.replace(/\D/g, "");
                  setFieldValue("phone", raw);
                }}
                onBlur={handleBlur("phone")}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <Text style={styles.sectionHeader}>
                {t("mainpass.personalinfo")}
              </Text>
              <TextInput
                placeholder="Имя"
                value={values.first_name}
                onChangeText={handleChange("first_name")}
                onBlur={handleBlur("first_name")}
                style={styles.input}
              />
              <TextInput
                placeholder="Фамилия"
                value={values.last_name}
                onChangeText={handleChange("last_name")}
                onBlur={handleBlur("last_name")}
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
                disabled={!values.first_name || !values.last_name}
              >
                <Text style={styles.saveButtonText}>{t("mainpass.save")}</Text>
              </TouchableOpacity>
            </ScrollView>
            {isUpdateLoading && <Loader />}
          </View>
        </KeyboardAvoidingView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D4AF37",
    marginVertical: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  saveButton: {
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditUserCabinetScreen;
