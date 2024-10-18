import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons

export default function WalletActionButton({ iconName, text, onPress }) {
  return (
    <TouchableOpacity style={{ alignItems: "center" }} onPress={onPress}>
      <Ionicons name={iconName} size={24} color="white" />
      <Text style={{ color: "white" }}>{text}</Text>
    </TouchableOpacity>
  );
}
