import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = "light" | "dark";

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;

  // Primary colors
  primary: string;
  primaryDark: string;
  secondary: string;

  // Status colors
  success: string;
  warning: string;
  error: string;

  // Border and shadow
  border: string;
  shadow: string;

  // Special colors
  streak: string;
  progress: string;
}

const lightTheme: ThemeColors = {
  background: "#f8f9fa",
  surface: "#ffffff",
  card: "#ffffff",

  text: "#333333",
  textSecondary: "#666666",
  textMuted: "#999999",

  primary: "#007bff",
  primaryDark: "#0056b3",
  secondary: "#28a745",

  success: "#28a745",
  warning: "#ffc107",
  error: "#dc3545",

  border: "#e0e0e0",
  shadow: "#000000",

  streak: "#ff6b35",
  progress: "#007bff",
};

const darkTheme: ThemeColors = {
  background: "#121212",
  surface: "#1e1e1e",
  card: "#2a2a2a",

  text: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",

  primary: "#4dabf7",
  primaryDark: "#2196f3",
  secondary: "#4caf50",

  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",

  border: "#333333",
  shadow: "#000000",

  streak: "#ff8a65",
  progress: "#4dabf7",
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const saveTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("appTheme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const colors = theme === "light" ? lightTheme : darkTheme;

  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
