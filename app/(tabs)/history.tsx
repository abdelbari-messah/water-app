import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../contexts/ThemeContext";

interface HistoryItem {
  date: string;
  intake: number;
}

export default function History() {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const intakeKeys = keys.filter((key) => key.startsWith("waterIntake_"));
      const historyData: HistoryItem[] = [];

      for (const key of intakeKeys) {
        const intake = await AsyncStorage.getItem(key);
        if (intake) {
          const date = key.replace("waterIntake_", "");
          historyData.push({ date, intake: parseInt(intake) });
        }
      }

      // Sort by date descending
      historyData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setHistory(historyData);

      // Calculate weekly average (last 7 days)
      const last7Days = historyData.slice(0, 7);
      if (last7Days.length > 0) {
        const total = last7Days.reduce((sum, item) => sum + item.intake, 0);
        setWeeklyAverage(Math.round(total / last7Days.length));
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load history.",
      });
    }
  };

  const exportHistory = async () => {
    try {
      const data = history
        .map((item) => `${item.date}: ${item.intake} ml`)
        .join("\n");
      const message = `WaterWise Hydration History\nWeekly Average: ${weeklyAverage} ml\n\n${data}`;
      await Share.share({ message });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to share history.",
      });
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
      <View style={styles.dateContainer}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.dateText, { color: colors.text }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.intakeContainer}>
        <Ionicons name="water" size={20} color={colors.primary} />
        <Text style={[styles.intakeText, { color: colors.text }]}>
          {item.intake} ml
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <Ionicons name="bar-chart-outline" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primary }]}>
          Hydration History
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your progress over time
        </Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={colors.secondary}
          />
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Weekly Average
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {weeklyAverage} ml
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="trending-up-outline"
            size={24}
            color={colors.secondary}
          />
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Days
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {history.length}
          </Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.primary }]}>
          Daily Records
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity
      style={[styles.exportButton, { backgroundColor: colors.primary }]}
      onPress={exportHistory}
    >
      <Ionicons name="share-outline" size={20} color={colors.card} />
      <Text style={[styles.exportText, { color: colors.card }]}>
        Share History
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        accessibilityLabel="List of past water intake records"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  exportButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 20,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exportText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  listHeader: {
    marginBottom: 15,
    paddingHorizontal: 0,
  },
  listContent: {
    paddingBottom: 40,
  },
  listCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
  },
  intakeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  intakeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
