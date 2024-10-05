import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import { wallet, block, tools } from "nanocurrency-web";
import { getAccountBalance, sendTransaction } from "../utils/nanoApi";
import { generateWork } from "../utils/nanoWork";
import * as SecureStore from "expo-secure-store";
import { fetchAndConvertTransactions } from "../services/nano/accountHistory";
import axios from "axios";

const NODE_URL = "https://rpc.nano.to";

export default function WalletScreen() {
  const [mnemonic, setMnemonic] = useState("");
  const [inputMnemonic, setInputMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [walletCreated, setWalletCreated] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [numberOfAccounts, setNumberOfAccounts] = useState(1);
  const [recipientAddress, setRecipientAddress] = useState("");

  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const [receiveTransactionHash, setReceiveTransactionHash] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  // Fetch transactions for the account
  const fetchTransactions = async () => {
    try {
      const transactionsInNano = await fetchAndConvertTransactions(address);
      setTransactions(transactionsInNano);
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  // Load transactions when the wallet is created and address is available
  useEffect(() => {
    if (walletCreated && address) {
      fetchTransactions();
    }
  }, [walletCreated, address]);

  // Function to securely save the mnemonic
  const saveWalletToSecureStore = async (mnemonic) => {
    try {
      await SecureStore.setItemAsync("wallet_mnemonic", mnemonic);
      console.log("Wallet saved successfully");
    } catch (error) {
      console.log("Error saving wallet:", error);
    }
  };

  // Function to load the wallet from SecureStore
  const loadWalletFromSecureStore = async () => {
    try {
      const storedMnemonic = await SecureStore.getItemAsync("wallet_mnemonic");
      if (storedMnemonic) {
        const loadedWallet = wallet.fromMnemonic(storedMnemonic);
        setMnemonic(storedMnemonic);
        setAddress(loadedWallet.accounts[0].address);
        setPrivateKey(loadedWallet.accounts[0].privateKey);
        setWalletCreated(true);
        setAccounts(loadedWallet.accounts);
      }
    } catch (error) {
      console.log("Error loading wallet:", error);
    }
  };

  // Load the wallet when the component mounts
  useEffect(() => {
    loadWalletFromSecureStore();
  }, []);

  // Generate a new wallet
  const generateWallet = () => {
    const newWallet = wallet.generate();
    setMnemonic(newWallet.mnemonic);
    setAddress(newWallet.accounts[0].address);
    setPrivateKey(newWallet.accounts[0].privateKey);
    setWalletCreated(true);
    setAccounts(newWallet.accounts);
    saveWalletToSecureStore(newWallet.mnemonic);
  };

  // Import a wallet with a mnemonic phrase
  const importWallet = () => {
    try {
      const importedWallet = wallet.fromMnemonic(inputMnemonic);
      setMnemonic(inputMnemonic);
      setAddress(importedWallet.accounts[0].address);
      setPrivateKey(importedWallet.accounts[0].privateKey);
      setWalletCreated(true);
      setAccounts(importedWallet.accounts);
      saveWalletToSecureStore(inputMnemonic);
    } catch (error) {
      alert("Invalid mnemonic phrase. Please try again.");
    }
  };

  // Derive more accounts from the seed
  const deriveAccounts = (fromIndex, toIndex) => {
    try {
      const moreAccounts = wallet.accounts(
        wallet.fromMnemonic(mnemonic).seed,
        fromIndex,
        toIndex
      );
      setAccounts((prevAccounts) => [...prevAccounts, ...moreAccounts]);
    } catch (error) {
      alert("Error deriving accounts. Please try again.");
    }
  };

  // Get the balance of an account
  const checkBalance = async () => {
    try {
      const balance = await getAccountBalance(address);
      setTransactionStatus(`Balance: ${balance} NANO`);
    } catch (error) {
      setTransactionStatus("Error checking balance. Please try again.");
    }
  };

  // Send NANO transaction
  const handleSendTransaction = async () => {
    try {
      // Fetch the frontier using account_info first
      const accountInfoResponse = await axios.post(NODE_URL, {
        action: "account_info",
        account: address,
      });

      if (accountInfoResponse.data.error) {
        setTransactionStatus(
          `Error fetching account info: ${accountInfoResponse.data.error}`
        );
        return;
      }

      // Fetch the balance first
      const balance = await getAccountBalance(address);
      const balanceInRaw = tools.convert(balance, "NANO", "RAW");

      const frontier = accountInfoResponse.data.frontier;

      // Ensure the frontier is valid
      if (!frontier || frontier === "0") {
        setTransactionStatus("Invalid frontier retrieved.");
        return;
      }

      // Generate work for the frontier
      const generatedWork = await generateWork(frontier);

      if (!generatedWork) {
        setTransactionStatus("Failed to generate work");
        return;
      }

      const data = {
        walletBalanceRaw: balanceInRaw, // Example balance
        fromAddress: address,
        toAddress: recipientAddress,
        representativeAddress:
          "nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs",
        frontier: frontier,
        amountRaw: tools.convert(amountToSend, "NANO", "RAW"),
        work: generatedWork,
      };

      const signedBlock = block.send(data, privateKey);
      const result = await sendTransaction(signedBlock);
      if (result) {
        setTransactionStatus(`Transaction sent: ${result.hash}`);
      } else {
        setTransactionStatus("Failed to send transaction.");
      }
    } catch (error) {
      setTransactionStatus("Error sending transaction: " + error.message);
    }
  };

  // Function to delete the wallet
  const deleteWallet = async () => {
    try {
      await SecureStore.deleteItemAsync("wallet_mnemonic");
      setMnemonic("");
      setAddress("");
      setPrivateKey("");
      setWalletCreated(false);
      setAccounts([]);
      setTransactionStatus("Wallet deleted successfully");
    } catch (error) {
      console.log("Error deleting wallet:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nano Wallet</Text>

        {!walletCreated ? (
          <>
            <Button title="Generate New Wallet" onPress={generateWallet} />

            <Text style={styles.label}>Or import an existing wallet:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mnemonic phrase"
              onChangeText={(text) => setInputMnemonic(text)}
              value={inputMnemonic}
            />
            <Button title="Import Wallet" onPress={importWallet} />
          </>
        ) : (
          <>
            <Text style={styles.label}>Mnemonic:</Text>
            <Text>{mnemonic}</Text>
            <Text style={styles.label}>Address:</Text>
            <Text>{address}</Text>
            <Text style={styles.label}>Private Key:</Text>
            <Text>{privateKey}</Text>
            <Text style={styles.label}>Accounts:</Text>
            {accounts.map((account, index) => (
              <View key={index} style={styles.accountContainer}>
                <Text>Account {index + 1}</Text>
                <Text>Address: {account.address}</Text>
                <Text>Private Key: {account.privateKey}</Text>
              </View>
            ))}
            <Button title="Check Balance" onPress={checkBalance} />
            <Button title="Refresh Transactions" onPress={fetchTransactions} />
            <Text style={styles.label}>Recent Transactions:</Text>
            {transactions.length === 0 ? (
              <Text>No transactions found</Text>
            ) : (
              transactions.map((tx, index) => (
                <View key={index} style={styles.transactionContainer}>
                  <Text>Type: {tx.type}</Text>
                  <Text>Hash: {tx.hash}</Text>
                  <Text>Amount: {tx.balanceNano} NANO</Text>
                </View>
              ))
            )}
            <TextInput
              style={styles.input}
              placeholder="Number of accounts to derive"
              keyboardType="numeric"
              onChangeText={(text) => setNumberOfAccounts(parseInt(text) || 1)}
            />
            <Button
              title={`Derive ${numberOfAccounts} More Accounts`}
              onPress={() =>
                deriveAccounts(
                  accounts.length,
                  accounts.length + numberOfAccounts
                )
              }
            />
            {/* Send Nano Section */}
            <Text style={styles.label}>Send Nano:</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipient Address"
              onChangeText={setRecipientAddress}
              value={recipientAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount to Send"
              keyboardType="numeric"
              onChangeText={setAmountToSend}
              value={amountToSend}
            />
            <Button title="Send Transaction" onPress={handleSendTransaction} />
            {transactionStatus ? <Text>{transactionStatus}</Text> : null}

            <Button title="Delete Wallet" onPress={deleteWallet} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  accountContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
});
