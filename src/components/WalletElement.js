import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/nanoStyles";

const WalletElement = ({ wallet }) => {
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);

  const openExplore = async () => {
    try {
      Linking.openURL("https://nanexplorer.com/nano/account/" + address);
    } catch (error) {
      console.log("https://nanexplorer.com/nano/account/" + address);
    }
  };

  <View
    style={{
      justifyContent: "space-around",
      flex: 1,
      flexDirection: "row",
      marginBottom: 20,
      paddingVertical: 16,
    }}
  >
    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={() => setSendModalVisible(true)}
    >
      <Ionicons name="arrow-up-circle" size={24} color="white" />
      <Text style={styles.headerText}>Send</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={() => setReceiveModalVisible(true)}
    >
      <Ionicons name="arrow-down-circle" size={24} color="white" />
      <Text style={styles.headerText}>Receive</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={{ alignItems: "center" }}
      onPress={() => setReceiveModalVisible(true)}
    >
      <Ionicons name="wallet" size={24} color="white" />
      <Text style={styles.headerText}>Buy</Text>
    </TouchableOpacity>
    {/* https://nanexplorer.com/nano/account/nano_3rpc3jcnyrw9ruhmz5y4q1acbk4ry7fxzcit5mzro3xzts4366k175ydofoi */}
    <TouchableOpacity style={{ alignItems: "center" }} onPress={openExplore}>
      <Ionicons name="exit" size={24} color="white" />
      <Text style={styles.headerText}>View</Text>
    </TouchableOpacity>
  </View>;
};

export default WalletElement;
