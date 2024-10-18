import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  Button,
  TextInput,
  RefreshControl,
} from "react-native";
import RecentTransactions, {
  createWallet,
  getBalance,
  sendSolTransaction,
  importWallet,
  fetchTransactions,
} from "../solanaFunctions";
import * as SecureStore from "expo-secure-store";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ScrollView } from "react-native-gesture-handler";

export default function SolScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [privateKey, setPrivateKey] = useState(""); // For importing wallet
  const [transactions, setTransactions] = useState([]);

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
      await sendSolTransaction(recipient, amount)
        .then((txSignature) =>
          console.log("Transaction confirmed:", txSignature)
        )
        .catch((error) => console.error("Failed to send transaction:", error));
    }
  };

  const handleFetchTransactions = async () => {
    if (wallet) {
      const fetchedTransactions = await fetchTransactions(wallet.publicKey);
      setTransactions(fetchedTransactions);
      console.log("Transactions:", transactions);
    }
  };

  // Function to handle the pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    try {
      // Re-fetch balance and transactions
      await handleCheckBalance();
      await handleFetchTransactions();
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

        <RecentTransactions transactions={transactions} />
      </SafeAreaView>
    </ScrollView>
  );
}
