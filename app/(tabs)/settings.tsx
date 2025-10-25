import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../contexts/ThemeContext";

const DEFAULT_GOAL = 2000;
const DEFAULT_INTERVAL = 2; // hours

export default function Settings() {
  const { theme, toggleTheme, colors } = useTheme();
  const [goal, setGoal] = useState(DEFAULT_GOAL.toString());
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [weight, setWeight] = useState("");
  const [useWeightBased, setUseWeightBased] = useState(false);
  const [customContainers, setCustomContainers] = useState<number[]>([]);
  const [newContainerSize, setNewContainerSize] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem("waterGoal");
      if (storedGoal) {
        setGoal(storedGoal);
      }
      const storedInterval = await AsyncStorage.getItem("reminderInterval");
      if (storedInterval) {
        setInterval(parseInt(storedInterval));
      }
      const storedWeight = await AsyncStorage.getItem("userWeight");
      if (storedWeight) {
        setWeight(storedWeight);
      }
      const storedUseWeight = await AsyncStorage.getItem("useWeightBased");
      if (storedUseWeight) {
        setUseWeightBased(storedUseWeight === "true");
      }
      const storedContainers = await AsyncStorage.getItem("customContainers");
      if (storedContainers) {
        setCustomContainers(JSON.parse(storedContainers));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("waterGoal", goal);
      await AsyncStorage.setItem("reminderInterval", interval.toString());
      await AsyncStorage.setItem("userWeight", weight);
      await AsyncStorage.setItem("useWeightBased", useWeightBased.toString());
      await AsyncStorage.setItem(
        "customContainers",
        JSON.stringify(customContainers)
      );
      Toast.show({
        type: "success",
        text1: "Settings Saved",
        text2: "Your settings have been updated.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const calculateGoalFromWeight = (w: string) => {
    const wNum = parseFloat(w);
    if (wNum > 0) {
      return (wNum * 30).toString(); // 30ml per kg
    }
    return DEFAULT_GOAL.toString();
  };

  const handleWeightChange = (w: string) => {
    setWeight(w);
    if (useWeightBased) {
      setGoal(calculateGoalFromWeight(w));
    }
  };

  const toggleWeightBased = () => {
    const newUse = !useWeightBased;
    setUseWeightBased(newUse);
    if (newUse && weight) {
      setGoal(calculateGoalFromWeight(weight));
    } else {
      setGoal(DEFAULT_GOAL.toString());
    }
  };

  const addCustomContainer = () => {
    const size = parseInt(newContainerSize);
    if (size > 0 && !customContainers.includes(size)) {
      setCustomContainers([...customContainers, size].sort((a, b) => a - b));
      setNewContainerSize("");
    }
  };

  const removeCustomContainer = (size: number) => {
    setCustomContainers(customContainers.filter((c) => c !== size));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <Ionicons name="settings-outline" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your hydration goals
        </Text>
      </View>

      <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
        <View style={styles.settingHeader}>
          <Ionicons name="scale-outline" size={24} color={colors.secondary} />
          <Text style={[styles.settingTitle, { color: colors.primary }]}>
            Weight-Based Goals
          </Text>
        </View>
        <Text
          style={[styles.settingDescription, { color: colors.textSecondary }]}
        >
          Automatically calculate your daily goal based on your weight (30ml per
          kg)
        </Text>
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {useWeightBased ? "Enabled" : "Disabled"}
          </Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              useWeightBased && [
                styles.toggleActive,
                { backgroundColor: colors.secondary },
              ],
            ]}
            onPress={toggleWeightBased}
          >
            <View
              style={[
                [styles.toggleCircle, { backgroundColor: colors.card }],
                useWeightBased && styles.toggleCircleActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {useWeightBased && (
        <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
          <View style={styles.settingHeader}>
            <Ionicons
              name="person-outline"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.settingTitle, { color: colors.primary }]}>
              Your Weight
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="Enter your weight in kg"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      )}

      <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
        <View style={styles.settingHeader}>
          <Ionicons name="water-outline" size={24} color={colors.secondary} />
          <Text style={[styles.settingTitle, { color: colors.primary }]}>
            Daily Water Goal
          </Text>
        </View>
        <TextInput
          style={[
            [
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ],
            useWeightBased && styles.inputDisabled,
          ]}
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          placeholder="e.g., 2000"
          placeholderTextColor={colors.textMuted}
          editable={!useWeightBased}
        />
      </View>

      <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
        <View style={styles.settingHeader}>
          <Ionicons name="time-outline" size={24} color={colors.secondary} />
          <Text style={[styles.settingTitle, { color: colors.primary }]}>
            Reminder Interval
          </Text>
        </View>
        <Text
          style={[styles.settingDescription, { color: colors.textSecondary }]}
        >
          How often to remind you to drink water
        </Text>
        <View style={styles.intervalContainer}>
          {[1, 2, 3].map((h) => (
            <TouchableOpacity
              key={h}
              style={[
                [
                  styles.intervalButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                  },
                ],
                interval === h && [
                  styles.selected,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setInterval(h)}
            >
              <Text
                style={[
                  [styles.intervalText, { color: colors.primary }],
                  interval === h && [
                    styles.selectedText,
                    { color: colors.card },
                  ],
                ]}
              >
                {h}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
        <View style={styles.settingHeader}>
          <Ionicons name="moon-outline" size={24} color={colors.secondary} />
          <Text style={[styles.settingTitle, { color: colors.primary }]}>
            Theme
          </Text>
        </View>
        <Text
          style={[styles.settingDescription, { color: colors.textSecondary }]}
        >
          Switch between light and dark themes
        </Text>
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              theme === "dark" && [
                styles.toggleActive,
                { backgroundColor: colors.secondary },
              ],
            ]}
            onPress={toggleTheme}
          >
            <View
              style={[
                [styles.toggleCircle, { backgroundColor: colors.card }],
                theme === "dark" && styles.toggleCircleActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
        <View style={styles.settingHeader}>
          <Ionicons name="flask-outline" size={24} color={colors.secondary} />
          <Text style={[styles.settingTitle, { color: colors.primary }]}>
            Custom Containers
          </Text>
        </View>
        <Text
          style={[styles.settingDescription, { color: colors.textSecondary }]}
        >
          Add your own cup or bottle sizes for quick logging
        </Text>

        <View style={styles.containerInputRow}>
          <TextInput
            style={[
              [
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ],
              styles.containerInput,
            ]}
            value={newContainerSize}
            onChangeText={setNewContainerSize}
            keyboardType="numeric"
            placeholder="Size in ml"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.secondary }]}
            onPress={addCustomContainer}
          >
            <Ionicons name="add" size={20} color={colors.card} />
          </TouchableOpacity>
        </View>

        {customContainers.length > 0 && (
          <View style={styles.containersList}>
            <Text
              style={[styles.containersLabel, { color: colors.textSecondary }]}
            >
              Your custom containers:
            </Text>
            <View style={styles.containersGrid}>
              {customContainers.map((size) => (
                <View
                  key={size}
                  style={[
                    styles.containerItem,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.containerText, { color: colors.text }]}>
                    {size}ml
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCustomContainer(size)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={saveSettings}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color={colors.card}
        />
        <Text style={[styles.saveText, { color: colors.card }]}>
          Save Settings
        </Text>
      </TouchableOpacity>
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
    color: "#007bff",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  settingDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ccc",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#28a745",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  intervalContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  intervalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  selected: {
    // backgroundColor will be set dynamically
  },
  intervalText: {
    fontSize: 16,
  },
  selectedText: {
    // color will be set dynamically
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  containerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  containerInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  containersList: {
    marginTop: 15,
  },
  containersLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  containersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  containerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  containerText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
});
