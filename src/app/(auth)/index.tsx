import { Loader } from "components";
import { Link, useRouter } from "expo-router";
import { useAuth } from "providers";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const router = useRouter();
  const { login, error, isAuthenticated, enterAsGuest } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/(main)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login({ login: mail, password });
      router.replace("/(tabs)/(main)");
    } catch (e) {
      Alert.alert("", t("common.errorInLgoin"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error?.text) {
      let errorMessage = "";
      try {
        errorMessage = JSON.parse(error.text)?.data?.msg;
      } catch {
        errorMessage = t("common.errorInLgoin");
      }
      Alert.alert("", errorMessage);
    }
  }, [error]);

  // Default view with two options
  if (!showLoginForm) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../../assets/icons/logo-white.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.enterButton}
          onPress={() => {
            enterAsGuest();
            router.replace("/(tabs)/(main)");
          }}
        >
          <Text style={styles.buttonText}>{t("mainpass.logintosystem")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => setShowLoginForm(true)}
        >
          <Text style={styles.buttonText}>{t("mainpass.loginbyacccount")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Login form view
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../../../assets/icons/logo-white.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.inputLabel}>{t("mainpass.loginfo")}</Text>

      <TextInput
        style={styles.input}
        placeholder="Введите почту"
        value={mail}
        onChangeText={setMail}
      />
      <Text style={styles.helperText}>{t("mainpass.mailexapmle")}</Text>

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.toggleEye}
          onPress={() => setSecureText(!secureText)}
        >
          <Text>{secureText ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      <Link href={{ pathname: "/(auth)/resetpassword" }} push asChild>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>
            {t("mainpass.passwordforget")}
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading || !mail || !password}
      >
        <Text style={styles.loginButtonText}>{t("mainpass.authorize")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => setShowLoginForm(false)}
      >
        <Text style={styles.buttonText}>{t("mainpass.backreturn")}</Text>
      </TouchableOpacity>
      {isLoading && <Loader />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 30,
  },
  enterButton: {
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  signInButton: {
    backgroundColor: "#A52A2A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
    marginBottom: 5,
  },
  helperText: {
    color: "#aaa",
    marginBottom: 15,
  },
  passwordWrapper: {
    position: "relative",
  },
  toggleEye: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  forgotPassword: {
    color: "#4F7942",
    fontWeight: "bold",
    marginVertical: 15,
  },
  loginButton: {
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
