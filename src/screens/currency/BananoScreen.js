import React, { useState, useEffect, useContext, useRef } from "react";
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
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { wallet, block, tools } from "bananocurrency-web";
import {
  getAccountBalance,
  sendTransaction,
  getAccountHistory,
  handleReceivableTransactions,
  generateWork,
} from "../../services/banano/bananoApi";
import * as SecureStore from "expo-secure-store";
import { fetchAndConvertTransactions } from "../../services/banano/accountHistory";
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
import { ThemeContext } from "../../utils/ThemeContext";
import WalletActions from "../../components/WalletActions";
import useModalAnimation from "../../hooks/useModalAnimation";
import GradientBackground from "../../components/GradientBackground";
import BananoTransactionList from "../../components/BananoTransactionList";
import StellarPriceDetail from "../../components/StellarPriceDetail";

const NODE_URL = "https://nodes.nanswap.com/BAN";

export default function BananoScreen() {
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
  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [lastTransactionHash, setLastTransactionHash] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [derivedAccountsModalVisible, setDerivedAccountsModalVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [receivingStatus, setReceivingStatus] = useState(null);

  const [sendToAddress, setSendToAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const [receiveTransactionHash, setReceiveTransactionHash] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  const navigation = useNavigation(); // Use navigation hook
  const { modalVisible, fadeAnim, translateYAnim, openModal, closeModal } =
    useModalAnimation();

  const { isDarkMode } = useContext(ThemeContext);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  const copyPrivateKeyToClipboard = async () => {
    await Clipboard.setStringAsync(privateKey);
    alert("Address copied to clipboard");
  };
  const copyMnemonicToClipboard = async () => {
    await Clipboard.setStringAsync(mnemonic);
    alert("Address copied to clipboard");
  };

  // Set up header with the info button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setDerivedAccountsModalVisible(true)}
          >
            <Image
              source={require("../../../assets/banano.png")} // Update the path to your image
              style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
            />
            <Text
              style={{
                color: isDarkMode ? "#ffffff" : "#000000",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Banano
            </Text>
          </TouchableOpacity>
        </View>
      ),
      headerShown: true,
      headerTransparent: true,
      headerMode: "float",
      headerStyle: {
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      },
      headerRight: () => (
        <TouchableOpacity onPress={openModal} style={{ marginRight: 15 }}>
          <Icon
            name="information-circle-outline"
            size={28}
            color="white"
            paddingRight={15}
          />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Icon name="arrow-back" size={28} color="white" paddingLeft={15} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
      fetchCurrentPrice();
      fetchHistoricalData();
      checkBalance();
    }
  }, [walletCreated, address]);

  // Function to securely save the mnemonic
  const saveWalletToSecureStore = async (mnemonic) => {
    try {
      await SecureStore.setItemAsync("banano_mnemonic", mnemonic);
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
      await fetchCurrentPrice();
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  };
  // Function to load the wallet from SecureStore
  const loadWalletFromSecureStore = async () => {
    try {
      const storedMnemonic = await SecureStore.getItemAsync("banano_mnemonic");
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
    } finally {
      setLoading(false);
    }
  };

  // Load the wallet when the component mounts
  useEffect(() => {
    setLoading(true);
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
      setTransactionStatus(`Balance: ${balance} BAN`);
    } catch (error) {
      setTransactionStatus("Error checking balance. Please try again.");
    }
  };

  // Send BAN transaction
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
      const balanceInRaw = tools.convert(balance, "BAN", "RAW");

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
          "ban_3bancat34ba3xkszt3f4wdyx8mih8d7nszi1raoghfmqch78eai3y3jmga1x",
        frontier: frontier,
        amountRaw: tools.convert(amountToSend, "BAN", "RAW"),
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
      await SecureStore.deleteItemAsync("banano_mnemonic");
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
      Linking.openURL("https://creeper.banano.cc/account/" + address);
    } catch (error) {
      console.log("https://creeper.banano.cc/account/" + address);
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

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=banano"
      );
      console.log("Current Price:", response.data[0].current_price);
      const price = parseFloat(response.data[0].current_price); // Get price_usd and convert to float
      const percentageChange = parseFloat(
        response.data[0].market_cap_change_percentage_24h
      );

      // Calculate the actual price change based on the percentage change
      const change = (price * (percentageChange / 100)).toFixed(4); // Calculate change and format to 4 decimal places

      // Get percent_change_24h and convert to float
      if (balance) {
        const value = price * parseFloat(balance); // Calculate fiat value
        setFiatBalance(value.toFixed(2)); // Update state with formatted value
        setPriceChange(change);
      }
      setPrice(price.toFixed(4));
      setPercentageChange(percentageChange); // Update state with formatted value
    } catch (error) {
      console.error("Error fetching price from CoinGecko:", error);
      alert("Failed to fetch price.");
      return null;
    }
  };

  const fetchHistoricalData = async () => {
    try {
      // Replace with a suitable endpoint that provides historical data for Ethereum
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/banano/market_chart?vs_currency=usd&days=1"
      );
      const prices = response.data.prices; // Extract prices from the response

      // Map the prices to a suitable format for charting (e.g., just the price values)
      const formattedPrices = prices.map((price) => price[1]); // price[1] is the price value
      setChartData(formattedPrices);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      alert("Failed to fetch historical price data.");
      return null;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F7931A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 110, // Adjust based on your header height
          backgroundColor: headerBackgroundColor,
          zIndex: 1, // Ensure it sits above other components
        }}
      />
      <GradientBackground isDarkMode={isDarkMode} />
      <Animated.ScrollView
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // Use native driver for better performance
        )}
        scrollEventThrottle={16} // Update every 16ms
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>
          <ScrollView style={{ padding: 15, minHeight: 140 }}>
            <View style={styles.container}>
              {/* Add the SendCryptoModule */}
              {/* <SendCryptoModule address={address} privateKey={privateKey} /> */}

              {/* Modal to display QR code and address */}
              <ReceiveNano
                name={"Banano"}
                visible={receiveModalVisible}
                onClose={() => setReceiveModalVisible(false)}
                address={address}
                onReceive={handleReceiveNano}
                receivingStatus={receivingStatus}
              />

              <Modal
                transparent
                visible={modalVisible}
                onRequestClose={closeModal}
              >
                <View style={styles.overlay}>
                  <Animated.View
                    style={[
                      styles.modalContent,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: translateYAnim }],
                      },
                    ]}
                  >
                    <Text style={styles.modalTitle}>Mnemonic</Text>
                    <Text selectable style={styles.secretKeyText}>
                      {mnemonic}
                    </Text>
                    <Button
                      title="Copy Mnemonic"
                      onPress={() => {
                        copyMnemonicToClipboard();
                      }}
                    />
                    <Text style={styles.modalTitle}>Private Key</Text>
                    <Text selectable style={styles.secretKeyText}>
                      {privateKey}
                    </Text>
                    <Button
                      title="Copy Private Key"
                      onPress={() => {
                        copyPrivateKeyToClipboard();
                      }}
                    />

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={deleteWallet}
                    >
                      <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                    </TouchableOpacity>
                    <Button title="Close" onPress={closeModal} />
                  </Animated.View>
                </View>
              </Modal>

              {/* Modal to send Banano */}
              <SendNano
                name={"Banano"}
                ticker={"BAN"}
                visible={sendModalVisible}
                setVisible={setSendModalVisible}
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
                  <Button
                    title="Generate New Wallet"
                    onPress={generateWallet}
                  />

                  <Text style={styles.label}>
                    Or import an existing wallet:
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter mnemonic phrase"
                    onChangeText={(text) => setInputMnemonic(text)}
                    value={inputMnemonic}
                  />
                  <Button
                    title="Import Wallet From Mnemonic"
                    onPress={importWallet}
                  />
                  <Button
                    title="Import Wallet From Legacy"
                    onPress={importWalletLegacy}
                  />
                </>
              ) : (
                <>
                  <View style={styles.balanceContainer}>
                    <Text selectable style={styles.balanceText}>
                      {balance ? balance : "0.00"} BAN
                    </Text>
                    <Text style={styles.fiatBalanceText}>
                      ${fiatBalance ? fiatBalance : "0.00"}
                    </Text>
                  </View>

                  {receivingStatus && (
                    <Text style={styles.receivingStatusText}>
                      {receivingStatus}
                    </Text>
                  )}
                  <WalletActions
                    isDarkMode={isDarkMode}
                    setSendModalVisible={setSendModalVisible}
                    setReceiveModalVisible={setReceiveModalVisible}
                    openExplore={openExplore}
                  />
                  <StellarPriceDetail
                    name={"Banano"}
                    price={price}
                    change={priceChange}
                    percentageChange={percentageChange}
                    chartData={chartData}
                  />
                  <BananoTransactionList
                    transactions={transactions}
                    userAddress={address}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
