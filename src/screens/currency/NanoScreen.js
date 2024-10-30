import React, { useState, useEffect, useContext } from "react";
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
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wallet, block, tools } from "nanocurrency-web";
import { ThemeContext } from "../../utils/ThemeContext";
import {
  getAccountBalance,
  sendTransaction,
  getAccountHistory,
  handleReceivableTransactions,
  generateWork,
} from "../../services/nano/nanoApi";
import * as SecureStore from "expo-secure-store";
import { fetchAndConvertTransactions } from "../../services/nano/accountHistory";
import axios from "axios";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import Icon from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import { styles } from "../../styles/nanoStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Entypo } from "@expo/vector-icons";
import SendNano from "../../components/SendNano";
import ReceiveNano from "../../components/ReceiveNano";
import WalletActionButton from "../../components/WalletActionButton";
import TransactionList from "../../components/NanoTransactionList";

const NODE_URL = "https://rpc.nano.to";

export default function NanoScreen() {
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
  const [lastTransactionHash, setLastTransactionHash] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [derivedAccountsModalVisible, setDerivedAccountsModalVisible] =
    useState(false);

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [receivingStatus, setReceivingStatus] = useState(null);

  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const [receiveTransactionHash, setReceiveTransactionHash] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const navigation = useNavigation(); // Use navigation hook

  const { isDarkMode } = useContext(ThemeContext);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    alert("Address copied to clipboard");
  };

  // Fetch transactions for the account
  const fetchTransactions = async () => {
    if (!address) {
      console.log("Address is undefined. Cannot fetch transactions.");
      return;
    }
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
      await SecureStore.setItemAsync("nano_mnemonic", mnemonic);
      console.log("Wallet saved successfully");
    } catch (error) {
      console.log("Error saving wallet:", error);
    }
  };

  // Function to handle the pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    try {
      // Receive pending transactions
      const receivedTransactions = await handleReceivableTransactions(
        address,
        privateKey
      );
      if (receivedTransactions && receivedTransactions.length > 0) {
        setReceivingStatus(
          `Received ${receivedTransactions.length} transaction(s)`
        );
      } else {
        setReceivingStatus("No pending transactions to receive");
      }
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
      const storedMnemonic = await SecureStore.getItemAsync("nano_mnemonic");
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

  // Import a wallet with a mnemonic phrase
  const importWalletLegacy = () => {
    try {
      const importedWallet = wallet.fromLegacyMnemonic(inputMnemonic);
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
      await SecureStore.deleteItemAsync("nano_mnemonic");
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

  const openExplore = async () => {
    try {
      Linking.openURL("https://nanexplorer.com/nano/account/" + address);
    } catch (error) {
      console.log("https://nanexplorer.com/nano/account/" + address);
    }
  };

  const handleReceiveNano = async () => {
    setReceivingStatus("Checking for receivable transactions...");
    try {
      const result = await handleReceivableTransactions(address, privateKey);
      if (result && result.length > 0) {
        setReceivingStatus(`Received ${result.length} transaction(s)`);
        // Refresh balance and transactions
        await checkBalance();
        await fetchTransactions();
      } else {
        setReceivingStatus("No pending transactions to receive");
      }
    } catch (error) {
      setReceivingStatus(`Error receiving: ${error.message}`);
    }
  };

  return (
    <LinearGradient colors={["#296fc5", "#3500A2"]} flex={1}>
      <ScrollView
        style={{ padding: 15, minHeight: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
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
              <Text style={[styles.balanceText, isDarkMode && styles.darkText]}>
                {balance} NANO
              </Text>
            )}
            {receivingStatus && (
              <Text style={styles.receivingStatusText}>{receivingStatus}</Text>
            )}
            <View
              style={{
                justifyContent: "space-around",
                flex: 1,
                flexDirection: "row",
                marginBottom: 20,
                paddingVertical: 16,
              }}
            >
              <WalletActionButton
                iconName="arrow-up-circle"
                text="Send"
                onPress={() => setSendModalVisible(true)}
              />

              <WalletActionButton
                iconName="arrow-down-circle"
                text="Receive"
                onPress={() => setReceiveModalVisible(true)}
              />

              <WalletActionButton
                iconName="wallet"
                text="Buy"
                onPress={() => {}}
              />

              <WalletActionButton
                iconName="exit"
                text="View"
                onPress={openExplore}
              />
            </View>
          </View>

          <View style={styles.container}>
            {/* Add the SendCryptoModule */}
            {/* <SendCryptoModule address={address} privateKey={privateKey} /> */}

            {/* Modal to display QR code and address */}
            <ReceiveNano
              visible={receiveModalVisible}
              onClose={() => setReceiveModalVisible(false)}
              address={address}
              onReceive={handleReceiveNano}
              receivingStatus={receivingStatus}
            />

            {/* Modal to send Nano */}
            <SendNano
              visible={sendModalVisible}
              onClose={() => setSendModalVisible(false)}
              handleSendTransaction={handleSendTransaction}
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              amountToSend={amountToSend}
              setAmountToSend={setAmountToSend}
              transactionStatus={transactionStatus}
            />

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
                <Button
                  title="Import Wallet Legacy"
                  onPress={importWalletLegacy}
                />
              </>
            ) : (
              <>
                <TransactionList transactions={transactions} />

                <Button title="Delete Wallet" onPress={deleteWallet} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
