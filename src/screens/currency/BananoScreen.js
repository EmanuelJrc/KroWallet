import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
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
  handleReceivableTransactions,
  generateWork,
} from "../../services/banano/bananoApi";
import * as SecureStore from "expo-secure-store";
import { fetchAndConvertTransactions } from "../../services/banano/accountHistory";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../../styles/nanoStyles";
import { ThemeContext } from "../../utils/ThemeContext";
import WalletActions from "../../components/WalletActions";
import useModalAnimation from "../../hooks/useModalAnimation";
import GradientBackground from "../../components/GradientBackground";
import BananoTransactionList from "../../components/BananoTransactionList";
import StellarPriceDetail from "../../components/StellarPriceDetail";
import SendModal from "../../components/modals/SendModal";
import ReceiveModal from "../../components/modals/ReceiveModal";
import { common } from "../../styles/common";
import WalletDetailsModal from "../../components/modals/WalletDetailsModal";
import DerivedAccountsModal from "../../components/modals/DerivedAccModal";

const NODE_URL = "https://nodes.nanswap.com/BAN";

export default function BananoScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [mnemonic, setMnemonic] = useState("");
  const [inputMnemonic, setInputMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [lastTransactionHash, setLastTransactionHash] = useState("");

  // State Managment
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [numberOfAccounts, setNumberOfAccounts] = useState(1);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [receivingStatus, setReceivingStatus] = useState(null);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [derivedAccountsModalVisible, setDerivedAccountsModalVisible] =
    useState(false);

  const { modalVisible, fadeAnim, translateYAnim, openModal, closeModal } =
    useModalAnimation();

  const [loading, setLoading] = useState(false);
  const [sendToAddress, setSendToAddress] = useState("");
  const [receiveTransactionHash, setReceiveTransactionHash] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  // Clipboard functions
  const copyToClipboard = async (text, type) => {
    await Clipboard.setStringAsync(text);
    alert(`${type} copied to clipboard`);
  };

  // Data Fetching
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

  const checkBalance = async () => {
    try {
      const balance = await getAccountBalance(address);
      setBalance(balance);
      setTransactionStatus(`Balance: ${balance} BAN`);
    } catch (error) {
      setTransactionStatus("Error checking balance. Please try again.");
    }
  };

  // Transaction Handling
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
        // Reset the form fields
        setRecipientAddress("");
        setAmountToSend("");
      } else {
        setTransactionStatus("Failed to send transaction.");
      }
    } catch (error) {
      setTransactionStatus("Error sending transaction: " + error.message);
    }
  };

  const handleReceiveNano = async () => {
    setReceivingStatus("Checking for receivable transactions...");
    try {
      const result = await handleReceivableTransactions(address, privateKey);
      if (result && result.length > 0) {
        setReceivingStatus(`Received ${result.length} transaction(s)`);
        await Promise.all([checkBalance(), fetchTransactions()]);
      } else {
        setReceivingStatus("No pending transactions to receive");
      }
    } catch (error) {
      setReceivingStatus(`Error receiving: ${error.message}`);
    }
  };

  // Refresh Handling
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        handleReceiveNano(),
        checkBalance(),
        fetchTransactions(),
        fetchCurrentPrice(),
      ]);
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigation handling
  const openExplore = () => {
    Linking.openURL(`https://creeper.banano.cc/account/${address}`);
  };

  // Effects
  useEffect(() => {
    if (walletCreated && address) {
      Promise.all([
        fetchTransactions(),
        fetchHistoricalData(),
        checkBalance(),
        fetchCurrentPrice(),
      ]);
    }
  }, [walletCreated, address]);

  // Set up header
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
  }, [navigation, isDarkMode]);

  // Function to securely save the mnemonic
  const saveWalletToSecureStore = async (mnemonic) => {
    try {
      await SecureStore.setItemAsync("banano_mnemonic", mnemonic);
      console.log("Wallet saved successfully");
    } catch (error) {
      console.log("Error saving wallet:", error);
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

  // Add this handler function with your other handlers
  const handleDeriveAccounts = useCallback(
    (fromIndex, toIndex) => {
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
    },
    [mnemonic]
  );

  // Function to delete the wallet
  const deleteWallet = async () => {
    try {
      await SecureStore.deleteItemAsync("banano_mnemonic");
      setMnemonic("");
      setAddress("");
      setPrivateKey("");
      setWalletCreated(false);
      setAccounts([]);
      closeModal();
      setTransactionStatus("Wallet deleted successfully");
    } catch (error) {
      console.log("Error deleting wallet:", error);
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
        style={[
          common.headerBackground,
          { backgroundColor: headerBackgroundColor },
        ]}
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
              <ReceiveModal
                name={"Banano"}
                visible={receiveModalVisible}
                onClose={() => setReceiveModalVisible(false)}
                address={address}
                onReceive={handleReceiveNano}
                receivingStatus={receivingStatus}
              />
              <WalletDetailsModal
                visible={modalVisible}
                onClose={closeModal}
                mnemonic={mnemonic}
                privateKey={privateKey}
                onCopy={copyToClipboard}
                onDelete={deleteWallet}
                fadeAnim={fadeAnim}
                translateYAnim={translateYAnim}
              />
              {/* Modal to send Banano */}
              <SendModal
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
              />
              {/* Add the DerivedAccountsModal component */}
              <DerivedAccountsModal
                visible={derivedAccountsModalVisible}
                onClose={() => setDerivedAccountsModalVisible(false)}
                accounts={accounts}
                numberOfAccounts={numberOfAccounts}
                setNumberOfAccounts={setNumberOfAccounts}
                deriveAccounts={handleDeriveAccounts}
              />
              {!walletCreated ? (
                <View style={styles.container}>
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
                </View>
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
