import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as StellarSdk from "@stellar/stellar-sdk";
import * as Clipboard from "expo-clipboard";

const StellarScreen = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [importSecretKey, setImportSecretKey] = useState("");

  // Function to generate Stellar wallet (keypair)
  const generateStellarWallet = () => {
    const keypair = StellarSdk.Keypair.random();
    setPublicKey(keypair.publicKey());
    setSecretKey(keypair.secret());
    console.log("Public Key:", keypair.publicKey());
    console.log("Secret Key:", keypair.secret());
  };

  // Function to import existing wallet using secret key
  const importWallet = () => {
    try {
      const keypair = StellarSdk.Keypair.fromSecret(importSecretKey);
      setPublicKey(keypair.publicKey());
      setSecretKey(importSecretKey);
      console.log("Imported Public Key:", keypair.publicKey());
    } catch (error) {
      console.error("Error importing wallet:", error);
      alert("Invalid secret key. Please try again.");
    }
  };

  // Check account balance
  const checkBalance = async () => {
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org"
    ); // Connecting to Stellar public network
    try {
      const account = await server.loadAccount(publicKey);
      const balances = account.balances;

      // Loop through balances to display them
      let balanceStr = "";
      balances.forEach((balance) => {
        balanceStr += `Balance: ${balance.balance}`;
      });
      setBalance(balanceStr);
    } catch (error) {
      console.error("Error fetching balance:", error);
      alert("Account not found. Make sure the public key is funded.");
    }
  };

  const copyToClipboardPublic = async () => {
    await Clipboard.setStringAsync(publicKey);
    alert("Copied to clipboard");
  };

  const copyToClipboardSecret = async () => {
    await Clipboard.setStringAsync(secretKey);
    alert("Copied to clipboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stellar Wallet</Text>

      <TouchableOpacity style={styles.button} onPress={generateStellarWallet}>
        <Text style={styles.buttonText}>Generate Stellar Wallet</Text>
      </TouchableOpacity>

      <View style={styles.importSection}>
        <Text style={styles.label}>Import Existing Wallet</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Secret Key"
          value={importSecretKey}
          onChangeText={setImportSecretKey}
        />
        <Button title="Import Wallet" onPress={importWallet} />
      </View>

      {publicKey && (
        <View style={styles.walletInfo}>
          <Text style={styles.label}>Public Key:</Text>
          <Text selectable>{publicKey}</Text>
          <Button title="Copy Public Key" onPress={copyToClipboardPublic} />

          <Text style={styles.label}>Secret Key:</Text>
          <Text selectable>{secretKey}</Text>
          <Button title="Copy Secret Key" onPress={copyToClipboardSecret} />
        </View>
      )}
      {balance && (
        <View style={styles.balanceInfo}>
          <Text style={styles.label}>Balance:</Text>
          <Text selectable>{balance}</Text>
        </View>
      )}

      {publicKey && <Button title="Check Balance" onPress={checkBalance} />}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0078FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  walletInfo: {
    marginTop: 30,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    width: "80%",
    height: 100,
  },
});

export default StellarScreen;
