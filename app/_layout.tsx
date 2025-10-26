import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "../contexts/ThemeContext";

const toastConfig = {
  success: (props: any) => (
    <View style={styles.toastContainer}>
      <View style={styles.successToast}>
        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastTitle}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastMessage}>{props.text2}</Text>
          )}
        </View>
      </View>
    </View>
  ),
  error: (props: any) => (
    <View style={styles.toastContainer}>
      <View style={styles.errorToast}>
        <Ionicons name="close-circle" size={24} color="#ef4444" />
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastTitle}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastMessage}>{props.text2}</Text>
          )}
        </View>
      </View>
    </View>
  ),
  info: (props: any) => (
    <View style={styles.toastContainer}>
      <View style={styles.infoToast}>
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastTitle}>{props.text1}</Text>
          {props.text2 && (
            <Text style={styles.toastMessage}>{props.text2}</Text>
          )}
        </View>
      </View>
    </View>
  ),
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast config={toastConfig} position="bottom" bottomOffset={100} />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  successToast: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  errorToast: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  infoToast: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  toastTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: "#6b7280",
  },
});
