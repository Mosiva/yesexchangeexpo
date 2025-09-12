import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function ResetPasswordScreen() {
  const [phone, setPhone] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.helperText}> Отправим код для восстановления пароля на почту, привязанную к этому аккаунту</Text>
      <Text style={styles.inputLabel}>Электронная почта</Text>

      <TextInput
        style={styles.input}
        placeholder="yourmail@mail.com"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.Button}>
        <Text style={styles.ButtonText}>Продолжить</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },

  inputLabel: {
    color: "#D4AF37",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  Button: {
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  ButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  helperText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginVertical: 5,
    marginBottom: 20,
  },
});
