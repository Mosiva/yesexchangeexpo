import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRScreen() {
  const qrValue = "gastropass-user-id-12345";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastro | Pass QR</Text>

      {/* Loyalty Card */}
      <TouchableOpacity style={styles.loyaltyCard}>
        <Text style={styles.loyaltyTitle}>Покажите QR сотруднику</Text>
        <Text style={styles.loyaltySubtext}>
          Или отсканируйте QR
        </Text>
      </TouchableOpacity>

      {/* QR Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Покажите QR код</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={qrValue} size={180} />
        </View>
        <Text style={styles.cardText}>
          Для защиты данных, QR обновляется каждые 10 секунд.
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Сканировать QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loyaltyCard: {
    width: "85%",
    backgroundColor: "#333",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  loyaltyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  loyaltySubtext: {
    color: "#ddd",
    fontSize: 14,
  },
  card: {
    width: "85%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
    textAlign: "center",
  },
  qrWrapper: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#333333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
