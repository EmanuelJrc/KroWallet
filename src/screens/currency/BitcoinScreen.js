// MainScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  generateAddress,
  generateScriptHash,
  getWalletPrivateKey,
} from "../../components/BitcoinWallet";

export default function BitcoinScreen() {
  const [address, setAddress] = useState(null);
  const [scriptHash, setScriptHash] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  // Load wallet data
  useEffect(() => {
    async function loadWalletData() {
      const walletAddress = await generateAddress();
      if (walletAddress) {
        setAddress(walletAddress.address);

        const scriptHash = await generateScriptHash(walletAddress.address);
        setScriptHash(scriptHash);

        const privateKey = await getWalletPrivateKey();
        setPrivateKey(privateKey);
      }
    }

    loadWalletData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitcoin Wallet</Text>

      {address && <Text>Address: {address}</Text>}
      {scriptHash && <Text>Script Hash: {scriptHash}</Text>}
      {privateKey && <Text>Private Key: {privateKey}</Text>}

      <Button title="Reload Wallet Data" onPress={() => loadWalletData()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
