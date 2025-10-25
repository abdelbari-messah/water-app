import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Toast from "react-native-toast-message";
import { useTheme } from "../../contexts/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DEFAULT_GOAL = 2000; // 2L in ml
const DEFAULT_INTERVAL = 2; // hours

export default function Index() {
  const { colors } = useTheme();
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [intake, setIntake] = useState(0);
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [streak, setStreak] = useState(0);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [customContainers, setCustomContainers] = useState<number[]>([]);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const newProgress = Math.min(intake / goal, 1);
    // Smoothly animate to the new progress value
    progressValue.value = withTiming(newProgress, { duration: 500 });
  }, [intake, goal, progressValue]);

  const animatedProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * 54; // radius = 54
    const clampedProgress = Math.min(progressValue.value, 1);
    const strokeDashoffset = circumference * (1 - clampedProgress);

    return {
      strokeDashoffset,
    };
  });

  const loadData = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem("waterGoal");
      const storedWeight = await AsyncStorage.getItem("userWeight");
      const storedUseWeight = await AsyncStorage.getItem("useWeightBased");
      if (storedUseWeight === "true" && storedWeight) {
        const weightNum = parseFloat(storedWeight);
        setGoal(weightNum > 0 ? weightNum * 30 : DEFAULT_GOAL);
      } else if (storedGoal) {
        setGoal(parseInt(storedGoal));
      }
      const storedInterval = await AsyncStorage.getItem("reminderInterval");
      if (storedInterval) {
        setInterval(parseInt(storedInterval));
      }
      const today = new Date().toDateString();
      const storedIntake = await AsyncStorage.getItem(`waterIntake_${today}`);
      if (storedIntake) {
        setIntake(parseInt(storedIntake));
      }
      const storedStreak = await AsyncStorage.getItem("currentStreak");
      if (storedStreak) {
        setStreak(parseInt(storedStreak));
      }
      const storedCustomContainers = await AsyncStorage.getItem(
        "customContainers"
      );
      if (storedCustomContainers) {
        setCustomContainers(JSON.parse(storedCustomContainers));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveIntake = async (newIntake: number) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`waterIntake_${today}`, newIntake.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const updateStreak = async (metGoal: boolean) => {
    try {
      const today = new Date().toDateString();
      const lastStreakDate = await AsyncStorage.getItem("lastStreakDate");
      if (metGoal) {
        if (lastStreakDate === today) {
          // Already updated today
        } else if (
          lastStreakDate === new Date(Date.now() - 86400000).toDateString()
        ) {
          // Consecutive day
          const newStreak = streak + 1;
          setStreak(newStreak);
          await AsyncStorage.setItem("currentStreak", newStreak.toString());
        } else {
          // Reset
          setStreak(1);
          await AsyncStorage.setItem("currentStreak", "1");
        }
        await AsyncStorage.setItem("lastStreakDate", today);
      } else {
        // If not met, don't update streak
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addWater = (amount: number) => {
    const newIntake = intake + amount;
    setIntake(newIntake);
    saveIntake(newIntake);
    const met = newIntake >= goal;
    updateStreak(met);
    if (met) {
      Toast.show({
        type: "success",
        text1: "Goal Reached! 🎉",
        text2: "Congratulations! You have met your daily water goal.",
      });
    }
  };

  const addCustomWater = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 5000) {
      addWater(amount);
      setCustomModalVisible(false);
      setCustomAmount("");
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount between 1 and 5000 ml.",
      });
    }
  };

  const resetWater = () => {
    setIntake(0);
    saveIntake(0);
    Toast.show({
      type: "info",
      text1: "Progress Reset",
      text2: "Your daily water intake has been reset to 0.",
    });
  };

  const getNextReminder = () => {
    const now = new Date();
    const startHour = 8; // 8am
    const endHour = 20; // 8pm
    for (let h = startHour; h <= endHour; h += interval) {
      const reminderTime = new Date();
      reminderTime.setHours(h, 0, 0, 0);
      if (reminderTime > now) {
        return reminderTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return "Tomorrow at 8:00 AM"; // If past last reminder
  };

  const hydrationTips = [
    "Drink water before meals to aid digestion.",
    "Carry a reusable water bottle for easy access.",
    "Set reminders on your phone to drink regularly.",
    "Eat water-rich foods like cucumbers and watermelon.",
    "Replace sugary drinks with water for better health.",
    "Drink a glass of water when you wake up.",
    "Herbal teas count towards your daily intake.",
    "Monitor your urine color; pale yellow means you're hydrated.",
    "Exercise increases water needs; drink more after workouts.",
    "Cold water can boost metabolism slightly.",
  ];

  const getDailyTip = () => {
    const today = new Date().getDate();
    return hydrationTips[today % hydrationTips.length];
  };

  const progress = Math.min(intake / goal, 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.primary }]}>WaterWise</Text>
      </View>

      <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
        <View style={styles.progressCircle}>
          <Svg
            width="140"
            height="140"
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            {/* Background circle */}
            <Circle
              cx="70"
              cy="70"
              r="54"
              stroke={colors.border}
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx="70"
              cy="70"
              r="54"
              stroke={colors.primary}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 54}`}
              animatedProps={animatedProps}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.progressCenter}>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {Math.round(progress * 100)}%
            </Text>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              Complete
            </Text>
          </View>
        </View>

        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {intake} / {goal} ml
          </Text>
        </View>
      </View>

      <View style={[styles.buttonCard, { backgroundColor: colors.card }]}>
        <View style={styles.buttonContainer}>
          {customContainers.length > 0 ? (
            // Show custom containers
            customContainers.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => addWater(size)}
                accessibilityLabel={`Add ${size} milliliters of water`}
                accessibilityHint={`Increases your daily intake by ${size} milliliters`}
              >
                <Ionicons name="water" size={24} color={colors.card} />
                <Text style={[styles.buttonText, { color: colors.card }]}>
                  +{size >= 1000 ? `${size / 1000} L` : `${size} ml`}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            // Show default buttons
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => addWater(250)}
                accessibilityLabel="Add 250 milliliters of water"
                accessibilityHint="Increases your daily intake by 250 milliliters"
              >
                <Ionicons name="water" size={24} color={colors.card} />
                <Text style={[styles.buttonText, { color: colors.card }]}>
                  +250 ml
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => addWater(500)}
                accessibilityLabel="Add 500 milliliters of water"
                accessibilityHint="Increases your daily intake by 500 milliliters"
              >
                <Ionicons name="water" size={24} color={colors.card} />
                <Text style={[styles.buttonText, { color: colors.card }]}>
                  +500 ml
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => addWater(1000)}
                accessibilityLabel="Add 1 liter of water"
                accessibilityHint="Increases your daily intake by 1000 milliliters"
              >
                <Ionicons name="water" size={24} color={colors.card} />
                <Text style={[styles.buttonText, { color: colors.card }]}>
                  +1 L
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.customButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setCustomModalVisible(true)}
            accessibilityLabel="Add custom amount of water"
            accessibilityHint="Opens input for custom water amount"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.customButtonText, { color: colors.primary }]}>
              Custom
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border || "#e0e0e0",
              },
            ]}
            onPress={resetWater}
            accessibilityLabel="Reset daily water intake"
            accessibilityHint="Resets your daily water intake progress to zero"
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.resetButtonText, { color: colors.textSecondary }]}
            >
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statsHeader}>
          <Ionicons name="stats-chart" size={20} color={colors.primary} />
          <Text style={[styles.statsTitle, { color: colors.primary }]}>
            Today&apos;s Progress
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="flame" size={28} color={colors.streak} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="trophy" size={28} color={colors.secondary} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {goal}ml
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Daily Goal
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="water" size={28} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {intake}ml
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Consumed
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={colors.secondary}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.max(0, goal - intake)}ml
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Remaining
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.reminderText, { color: colors.text }]}>
            Next: {getNextReminder()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.tipText, { color: colors.text }]}>
            {getDailyTip()}
          </Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={customModalVisible}
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              Enter Custom Amount (ml)
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              placeholder="e.g., 300"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addCustomWater}
              >
                <Text style={[styles.modalButtonText, { color: colors.card }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 18,
  },
  statsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statContent: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    width: "100%",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    position: "relative",
  },
  progressCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 12,
  },
  progressInfo: {
    alignItems: "center",
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reminderText: {
    fontSize: 16,
    marginLeft: 10,
  },
  tipText: {
    fontSize: 16,
    marginLeft: 10,
    fontStyle: "italic",
  },
  buttonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 12,
    marginHorizontal: 5,
  },
  customButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 2.5,
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    width: "100%",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 2.5,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
});
