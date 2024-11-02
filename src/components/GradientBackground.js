import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const GradientBackground = ({ isDarkMode }) => (
  <LinearGradient
    colors={
      isDarkMode
        ? ["#296fc5", "#3d3d3d", "#3d3d3d", "#333333"]
        : ["#296fc5", "#5d97dd", "#ffffff", "#f0f0f0"]
    }
    style={StyleSheet.absoluteFill}
  />
);

export default GradientBackground;
