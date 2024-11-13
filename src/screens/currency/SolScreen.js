import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Modal,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Animated,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import RecentTransactions, {
  createWallet,
  getBalance,
  sendSolTransaction,
  importWallet,
  fetchTransactions,
  PrivateKeyDisplay,
} from "../../services/solana/solanaFunctions";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../styles/solanaStyles";
import { ThemeContext } from "../../utils/ThemeContext";
import WalletActions from "../../components/WalletActions";
import GradientBackground from "../../components/GradientBackground";
import StellarPriceDetail from "../../components/StellarPriceDetail";
import axios from "axios";
import SendModal from "../../components/modals/SendModal";
import ReceiveModal from "../../components/modals/ReceiveModal";
import WalletSetup from "../../components/WalletSetup";

export default function SolScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [amount, setAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [privateKey, setPrivateKey] = useState(null); // For importing wallet
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  // Load wallet when the screen is opened
  useEffect(() => {
    const loadWallet = async () => {
      const storedWallet = await SecureStore.getItemAsync("solana_wallet");
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet(parsedWallet);
        setWalletCreated(true);
        setPrivateKey(parsedWallet.privateKey);
      }
    };

    loadWallet();
  }, []);

  // Set up header with the info button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../assets/solana.png")} // Update the path to your image
            style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
          />
          <Text
            style={{
              color: isDarkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Solana
          </Text>
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

  const handleCreateWallet = async () => {
    const newWallet = await createWallet();
    setWallet(newWallet);
    setWalletCreated(true);
    setPrivateKey(newWallet.privateKey);
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

  // Fade and slide animations for opening the modal
  const openModal = async () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fade and slide animations for closing the modal
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

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
      await fetchCurrentPrice();
      await fetchHistoricalData();
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

  publicKey = wallet?.publicKey;

  const openExplore = async () => {
    try {
      Linking.openURL(
        "https://solscan.io/account/" + publicKey + "?cluster=devnet"
      );
    } catch (error) {
      console.log(
        "https://solscan.io/account/" + publicKey + "?cluster=devnet"
      );
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana"
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
      setPercentageChange(percentageChange.toFixed(2)); // Update state with formatted value
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
        "https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1"
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
              <SendModal
                name={"Solana"}
                ticker={"SOL"}
                visible={sendModalVisible}
                setVisible={setSendModalVisible}
                onClose={() => setSendModalVisible(false)}
                handleSendTransaction={handleSendTransaction}
                recipientAddress={recipient}
                setRecipientAddress={setRecipient}
                amountToSend={amount.toString()}
                setAmountToSend={setAmount}
              />

              <ReceiveModal
                name={"Solana"}
                visible={receiveModalVisible}
                onClose={() => setReceiveModalVisible(false)}
                address={publicKey}
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
                    <Text style={styles.modalTitle}>Private Key</Text>
                    <PrivateKeyDisplay />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteWallet}
                    >
                      <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                    </TouchableOpacity>
                    <Button title="Close" onPress={closeModal} />
                  </Animated.View>
                </View>
              </Modal>

              {!walletCreated ? (
                <>
                  <WalletSetup
                    isDarkMode={isDarkMode}
                    importSecretKey={privateKey}
                    setImportSecretKey={setPrivateKey}
                    importWallet={handleImportWallet}
                    generateWallet={handleCreateWallet}
                    walletCreated={walletCreated}
                  />
                </>
              ) : (
                <>
                  <View style={styles.balanceSection}>
                    <View style={styles.balanceInfo}>
                      <Text selectable style={styles.balanceText}>
                        {balance} SOL
                      </Text>
                      <Text style={styles.fiatBalanceText}>
                        ${fiatBalance ? fiatBalance : "0.00"}
                      </Text>
                    </View>
                  </View>

                  <WalletActions
                    isDarkMode={isDarkMode}
                    setSendModalVisible={setSendModalVisible}
                    setReceiveModalVisible={setReceiveModalVisible}
                    openExplore={openExplore}
                  />
                  <StellarPriceDetail
                    name={"Solana"}
                    price={price}
                    change={priceChange}
                    percentageChange={percentageChange}
                    chartData={chartData}
                  />
                  <RecentTransactions transactions={transactions} />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
