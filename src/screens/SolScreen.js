import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, Button, TextInput } from "react-native";
import {
  createWallet,
  getBalance,
  sendTransaction,
  importWallet,
} from "../solanaFunctions";
import * as SecureStore from "expo-secure-store";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ScrollView } from "react-native-gesture-handler";

export default function SolScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [privateKey, setPrivateKey] = useState(""); // For importing wallet

  useEffect(() => {
    const loadWallet = async () => {
      const storedWallet = await SecureStore.getItemAsync("solana_wallet");
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet(parsedWallet);
      }
    };

    loadWallet();
  }, []);

  const handleCreateWallet = async () => {
    const newWallet = await createWallet();
    setWallet(newWallet);
  };

  const handleImportWallet = async () => {
    try {
      const importedWallet = await importWallet(privateKey);
      setWallet(importedWallet);
    } catch (error) {
      console.error("Failed to import wallet:", error);
    }
  };

  const handleCheckBalance = async () => {
    if (wallet) {
      const walletBalance = await getBalance(wallet.publicKey);
      setBalance(walletBalance);
    }
  };

  const handleSendTransaction = async () => {
    if (wallet) {
      await sendTransaction(
        wallet.keypair,
        recipient,
        amount * LAMPORTS_PER_SOL
      ); // Convert to lamports
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Create Wallet" onPress={handleCreateWallet} />
      {wallet && <Text>Wallet Address: {wallet.publicKey}</Text>}

      <Button title="Check Balance" onPress={handleCheckBalance} />
      {balance !== null && <Text>Balance: {balance} SOL</Text>}

      <TextInput
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Amount (in SOL)"
        value={amount}
        onChangeText={(text) => setAmount(Number(text))}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="Send Transaction" onPress={handleSendTransaction} />

      <TextInput
        placeholder="Enter Private Key to Import"
        value={privateKey}
        onChangeText={setPrivateKey}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title="Import Wallet" onPress={handleImportWallet} />
    </SafeAreaView>
  );
}
