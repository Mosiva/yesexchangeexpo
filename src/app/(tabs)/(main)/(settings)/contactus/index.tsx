import { useFocusEffect } from "@react-navigation/native";
import Checkbox from "expo-checkbox";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clientApi } from "services";

const { useGetClientQuery } = clientApi;

export default function ContactUsScreen() {
  const { t, i18n } = useTranslation();
  const { data: clientData } = useGetClientQuery({});
  const [isChecked, setChecked] = useState(false);

  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (clientData) {
        setName(clientData.name || "");
        setEmail(clientData.email || "");
        setPhone(clientData.phone || "");
      }
    }, [clientData])
  );

  const handleSubmit = () => {
    // Здесь логика отправки формы (например, API-запрос)
    console.log({
      mainCategory,
      subCategory,
      name,
      email,
      phone,
      message,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.description}>{t("mainpass.questionsupport")}</Text>

      <TextInput
        style={styles.input}
        placeholder="Основная категория"
        value={mainCategory}
        onChangeText={setMainCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Подкатегория"
        value={subCategory}
        onChangeText={setSubCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Имя"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email-адрес"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Номер телефона"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.messageLabel}>{t("mainpass.message")}</Text>
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Введите сообщение"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />
      <Text style={styles.orText}>{t("mainpass.or")}</Text>

      <TouchableOpacity
        style={styles.phoneButton}
        onPress={() => Linking.openURL("tel:+77273399860")}
      >
        <Text style={styles.phoneText}>+7 727 339 98 60</Text>
      </TouchableOpacity>

      <View style={styles.checkboxContainer}>
        <Checkbox value={isChecked} onValueChange={setChecked} />
        <Text style={styles.checkboxText}>{t("mainpass.agree")}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t("mainpass.send")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageLabel: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  orText: {
    textAlign: "center",
    marginVertical: 8,
    fontSize: 16,
    color: "#666",
  },
  phoneButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  phoneText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  privacyText: {
    fontSize: 12,
    color: "#444",
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#444",
  },
});
