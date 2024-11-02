import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../styles/stellarStyles";

const WalletActions = ({
  isDarkMode,
  setSendModalVisible,
  setReceiveModalVisible,
  openExplore,
}) => (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity
      style={[styles.actionButton, isDarkMode && styles.darkButton]}
      onPress={() => setSendModalVisible(true)}
    >
      <Icon name="send" size={24} color={isDarkMode ? "white" : "black"} />
      <Text style={[styles.actionButtonText, isDarkMode && styles.darkText]}>
        Send
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.actionButton, isDarkMode && styles.darkButton]}
      onPress={() => setReceiveModalVisible(true)}
    >
      <Icon name="download" size={24} color={isDarkMode ? "white" : "black"} />
      <Text style={[styles.actionButtonText, isDarkMode && styles.darkText]}>
        Receive
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.actionButton, isDarkMode && styles.darkButton]}
    >
      <Icon
        name="cash-outline"
        size={24}
        color={isDarkMode ? "white" : "black"}
      />
      <Text style={[styles.actionButtonText, isDarkMode && styles.darkText]}>
        Buy
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.actionButton, isDarkMode && styles.darkButton]}
      onPress={openExplore}
    >
      <Icon name="exit" size={24} color={isDarkMode ? "white" : "black"} />
      <Text style={[styles.actionButtonText, isDarkMode && styles.darkText]}>
        View
      </Text>
    </TouchableOpacity>
  </View>
);

export default WalletActions;
