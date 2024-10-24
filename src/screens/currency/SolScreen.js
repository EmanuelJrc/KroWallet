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
} from "../../services/solana/solanaFunctions";
import * as SecureStore from "expo-secure-store";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ScrollView } from "react-native-gesture-handler";
import WalletActionButton from "../../components/WalletActionButton";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../styles/nanoStyles";

export default function SolScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [amount, setAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [privateKey, setPrivateKey] = useState(""); // For importing wallet
  const [transactions, setTransactions] = useState([]);

  // Load wallet when the screen is opened
  useEffect(() => {
    const loadWallet = async () => {
      const storedWallet = await SecureStore.getItemAsync("solana_wallet");
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet(parsedWallet);
        setWalletCreated(true);
      }
    };

    loadWallet();
  }, []);

  // Load balance and transactions when the wallet is set
  useEffect(() => {
    const fetchData = async () => {
      if (wallet) {
        await handleCheckBalance();
        await handleFetchTransactions();
      }
    };

    fetchData();
  }, [wallet]);

  const handleCreateWallet = async () => {
    const newWallet = await createWallet();
    setWallet(newWallet);
    setWalletCreated(true);
  };

  const handleImportWallet = async () => {
    try {
      const importedWallet = await importWallet(privateKey);
      setWallet(importedWallet);
      setWalletCreated(true);
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

  // Function to delete the wallet from SecureStore
  const handleDeleteWallet = async () => {
    try {
      await SecureStore.deleteItemAsync("solana_wallet");
      setWallet(null);
      setWalletCreated(false);
      setBalance(null);
      setRecipient("");
      setAmount(0);
      setTransactions([]);
      console.log("Wallet deleted successfully");
    } catch (error) {
      console.log("Error deleting wallet:", error);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={["#1ce6eb", "#296fc5", "#3500A2"]}
        style={{ padding: 15, minHeight: 140, justifyContent: "center" }}
      >
        {wallet && <Text>Private key: {wallet.privateKey}</Text>}
        {wallet && <Text>Wallet Address: {wallet.publicKey}</Text>}
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

        {!walletCreated ? (
          <>
            <Button title="Generate New Wallet" onPress={handleCreateWallet} />

            <Text style={styles.label}>Or import an existing wallet:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Private Key to Import"
              onChangeText={setPrivateKey}
              value={privateKey}
            />
            <Button title="Import Wallet" onPress={handleImportWallet} />
          </>
        ) : (
          <>
            <RecentTransactions transactions={transactions} />

            <Button title="Delete Wallet" onPress={handleDeleteWallet} />
          </>
        )}
      </LinearGradient>
    </ScrollView>
  );
}
