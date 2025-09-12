import { useRouter } from "expo-router";
import { useAuth } from "providers";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { clientApi } from "services";
const { useGetClientQuery, useDeleteClientMutation } = clientApi;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [deleteClient] = useDeleteClientMutation();

  const { data: clientData, isLoading: isClientLoading } = useGetClientQuery(
    {}
  );
  const handleDeleteClient = async () => {
    try {
      await deleteClient({}).unwrap();
      Toast.show({
        type: "success",
        text1: t("mainpass.isdeleteaccount"),
      });
      logout(); // from useAuth()
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("mainpass.isnotdeleteaccount"),
      });
    }
  };

  const client = clientData?.data || null;

  return (
    <ScrollView style={styles.container}>
      {/* Профиль */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{client?.first_name}</Text>
          <Text style={styles.email}>{client?.email}</Text>
        </View>
      </View>

      {/* Учетная запись */}

      <Text style={styles.sectionTitle}>{t("mainpass.myaccount")}</Text>

      <MenuItem
        label={t("mainpass.setmyaccount")}
        onPress={() => router.push("/editUserCabinet")}
      />
      <MenuItem
        label={t("mainpass.accounthistory")}
        onPress={() => router.push("/userhistory")}
      />

      {/* Язык / Контакты */}
      <Text style={styles.sectionTitle}>{t("mainpass.setlanguage")}</Text>
      <MenuItem
        label={t("mainpass.changelanguage")}
        onPress={() => router.push("/languageswitcher")}
      />

      <Text style={styles.sectionTitle}>{t("mainpass.contactus")}</Text>
      <MenuItem
        label={t("mainpass.contactinfo")}
        onPress={() => router.push("/contactus")}
      />

      {/* Оферта */}
      <Text style={styles.sectionTitle}>{t("mainpass.publicoffert")}</Text>

      <MenuItem
        label={t("mainpass.programuserule")}
        onPress={() => router.push("/rules")}
      />

      {showDeleteButton ? (
        <>
          <Text style={styles.deletelClientTitle1}>
            {t("mainpass.accountdeleteprov")}
          </Text>
          <View style={styles.deleteButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmDeleteButton]}
              onPress={handleDeleteClient}
            >
              <Text style={styles.deleteText}>{t("mainpass.delete")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowDeleteButton(false)}
            >
              <Text style={styles.cancelText}>{t("mainpass.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Выйти */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>{t("mainpass.logout")}</Text>
          </TouchableOpacity>
          <Text
            style={styles.deletelClientTitle}
            onPress={() => setShowDeleteButton(true)}
          >
            {t("mainpass.accountdelete")}
          </Text>
        </>
      )}
    </ScrollView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToggleItem({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <View style={styles.toggleItem}>
      <Text style={styles.menuText}>{label}</Text>
      <Switch value={enabled} onValueChange={setEnabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#A52A2A",
  },
  email: {
    fontSize: 14,
    color: "#000",
  },
  verifyWarning: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
  verifyLink: {
    textDecorationLine: "underline",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DAA520",
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#4F7942",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#999",
  },
  deletelClientTitle1: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  deleteButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 50,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  confirmDeleteButton: {
    backgroundColor: "#B22222",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  deleteBtn: {
    marginTop: 16,
    backgroundColor: "#B22222",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 20,
  },
  deletelClientTitle: {
    fontSize: 12,
    fontWeight: "condensed",
    color: "grey",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 50,
  },
});
