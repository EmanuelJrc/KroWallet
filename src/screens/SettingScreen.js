import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  useColorScheme,
  Switch,
} from "react-native";
import { ThemeContext } from "../utils/ThemeContext";

const SettingScreen = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <Text
        style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}
      >
        Settings
      </Text>
      <View style={styles.darkModeContainer}>
        <Text
          style={[
            styles.darkModeText,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  lightText: {
    color: "#000000",
  },
  darkText: {
    color: "#FFFFFF",
  },
  darkModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  darkModeText: {
    marginRight: 10,
    fontSize: 18,
  },
});

export default SettingScreen;
