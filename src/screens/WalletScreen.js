import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wallet, block, tools } from "nanocurrency-web";
import { getAccountBalance, sendTransaction } from "../utils/nano/nanoApi";
import { generateWork } from "../utils/nano/nanoWork";
import * as SecureStore from "expo-secure-store";
import { fetchAndConvertTransactions } from "../services/nano/accountHistory";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import SendCryptoModule from "../utils/nano/sendNano";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import { styles } from "../styles/nanoStyles";

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
  const [balance, setBalance] = useState(null); // Add state for balance
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [derivedAccountsModalVisible, setDerivedAccountsModalVisible] =
    useState(false);

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);

  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const [receiveTransactionHash, setReceiveTransactionHash] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const navigation = useNavigation(); // Use navigation hook

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    alert("Address copied to clipboard");
  };

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
      checkBalance();
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

  // Function to handle the pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    try {
      // Re-fetch balance and transactions
      await checkBalance();
      await fetchTransactions();
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false); // Stop refreshing
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
      setBalance(balance);
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
        alert(`Sending ${sendAmount} to ${recipientAddress}`);
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
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text
            style={styles.title}
            onPress={() => setDerivedAccountsModalVisible(true)}
          >
            Nano Wallet{" "}
          </Text>
          <Icon
            name="information-circle"
            size={24}
            color="black"
            style={styles.detailIcon}
            onPress={() => {
              navigation.navigate("ShowDetail", { mnemonic, privateKey });
            }}
          />
        </View>
        {balance !== null && (
          <Text style={styles.balanceText}>{balance} NANO</Text>
        )}

        {/* Add the SendCryptoModule */}
        {/* <SendCryptoModule address={address} privateKey={privateKey} /> */}
        <View
          style={{
            justifyContent: "space-around",
            flex: 1,
            flexDirection: "row",
            marginBottom: 20,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Icon
              name="arrow-up-circle"
              size={24}
              onPress={() => setSendModalVisible(true)}
            />
            <Text style={styles.modalText}>Send</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Icon
              name="arrow-down-circle"
              size={24}
              onPress={() => setReceiveModalVisible(true)}
            />
            <Text style={styles.modalText}>Receive</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Icon
              name="wallet"
              size={24}
              onPress={() => setReceiveModalVisible(true)}
            />
            <Text style={styles.modalText}>Buy</Text>
          </View>
        </View>

        {/* Modal to display QR code and address */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={receiveModalVisible}
          onRequestClose={() => {
            setReceiveModalVisible(!receiveModalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Receive Nano</Text>

              {/* Display QR code of the address */}
              {address ? (
                <QRCode value={address} size={200} />
              ) : (
                <Text>No address available</Text>
              )}

              {/* Display the wallet address */}
              <Text style={styles.addressText}>{address}</Text>

              {/* Copy button */}
              <Pressable style={styles.button} onPress={copyToClipboard}>
                <Text style={styles.textStyle}>Copy Address</Text>
              </Pressable>

              {/* Close the modal */}
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setReceiveModalVisible(!receiveModalVisible)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={sendModalVisible}
          onRequestClose={() => {
            setSendModalVisible(!sendModalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.sendModalView}>
              {/* Send Nano Section */}
              <Text style={styles.modalTitle}>Send Nano:</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Recipient Address"
                placeholderTextColor="#C0C0C0"
                onChangeText={setRecipientAddress}
                value={recipientAddress}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Amount"
                placeholderTextColor="#C0C0C0"
                keyboardType="numeric"
                onChangeText={setAmountToSend}
                value={amountToSend.replace(",", ".")}
              />

              {transactionStatus ? <Text>{transactionStatus}</Text> : null}
              <Pressable style={styles.button} onPress={handleSendTransaction}>
                <Text style={styles.buttonText}>Send Nano</Text>
              </Pressable>

              {/* Close the modal */}
              <Pressable
                style={[styles.sendButton, styles.sendButtonClose]}
                onPress={() => setSendModalVisible(!sendModalVisible)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Modal for Derived Accounts */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={derivedAccountsModalVisible}
          onRequestClose={() => setDerivedAccountsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Derived Accounts</Text>

              {/* Display all derived accounts */}
              {accounts.map((account, index) => (
                <View key={index} style={styles.accountContainer}>
                  <Text>Account {index + 1}</Text>
                  <Text>Address: {account.address}</Text>
                </View>
              ))}

              {/* Input to derive new accounts */}
              <TextInput
                style={styles.input}
                placeholder="Number of accounts to derive"
                keyboardType="numeric"
                onChangeText={(text) =>
                  setNumberOfAccounts(parseInt(text) || 1)
                }
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

              {/* Close the modal */}
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setDerivedAccountsModalVisible(false)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

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
            <Text style={styles.recent}>Recent Transactions:</Text>
            {transactions.length === 0 ? (
              <Text>No transactions found</Text>
            ) : (
              transactions.map((tx, index) => (
                <View key={index} style={styles.transactionContainer}>
                  {/* Icon for transaction type */}
                  <View style={styles.transactionHeader}>
                    {tx.type === "send" ? (
                      <Icon
                        name="arrow-up-circle-outline"
                        size={24}
                        color="red"
                      />
                    ) : (
                      <Icon
                        name="arrow-down-circle-outline"
                        size={24}
                        color="green"
                      />
                    )}
                    <Text style={styles.transactionType}>
                      {tx.type === "send" ? "Sent" : "Received"}
                    </Text>
                  </View>

                  {/* Transaction details */}
                  <Text style={styles.transactionHash}>Hash: {tx.hash}</Text>
                  <Text style={styles.transactionDate}>
                    Date: {new Date(tx.timestamp * 1000).toLocaleString()}{" "}
                    {/* Assuming you have a timestamp */}
                  </Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: tx.type === "send" ? "red" : "green" },
                    ]}
                  >
                    Amount: {tx.balanceNano} NANO
                  </Text>
                </View>
              ))
            )}

            <Button title="Delete Wallet" onPress={deleteWallet} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
