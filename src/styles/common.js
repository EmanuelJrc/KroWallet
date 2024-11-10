import { StyleSheet } from "react-native";

export const common = StyleSheet.create({
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110, // Adjust based on your header height
    zIndex: 1, // Ensure it sits above other components
  },
});
