import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { generateWallet } from "../services/bitcoinService";
import * as SecureStore from "expo-secure-store";

export default function DogeScreen({ navigation }) {
  const [wallet, setWallet] = useState(null);

  const handleCreateWallet = () => {
    const newWallet = generateWallet();
    setWallet(newWallet);

    // Save private key securely
    SecureStore.setItemAsync("privateKey", newWallet.privateKey);
    SecureStore.setItemAsync("address", newWallet.address);
  };

  return (
    <View style={styles.container}>
      <Button title="Create New Wallet" onPress={handleCreateWallet} />
      {wallet && (
        <View style={styles.walletInfo}>
          <Text style={styles.text}>Bitcoin Address: {wallet.address}</Text>
          <Text style={styles.text}>Private Key: {wallet.privateKey}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  walletInfo: {
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
});
