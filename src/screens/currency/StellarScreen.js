import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
  Linking,
  Alert,
  Modal,
  Animated,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as StellarSdk from "@stellar/stellar-sdk";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";
import { ThemeContext } from "../../utils/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import StellarPriceDetail from "../../components/StellarPriceDetail";
import { styles } from "../../styles/stellarStyles";
import useModalAnimation from "../../hooks/useModalAnimation";
import WalletActions from "../../components/WalletActions";
import GradientBackground from "../../components/GradientBackground";
import { Button } from "react-native-paper";
import SendModal from "../../components/modals/SendModal";
import ReceiveModal from "../../components/modals/ReceiveModal";

const StellarScreen = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [destination, setDestination] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [amount, setAmount] = useState("");
  const [importSecretKey, setImportSecretKey] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartData, setChartData] = useState([]);

  const navigation = useNavigation();
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

  // Set up header with the info button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../assets/stellar.png")} // Update the path to your image
            style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
          />
          <Text
            style={{
              color: isDarkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Stellar
          </Text>
        </View>
      ),
      headerShown: true,
      headerTransparent: true,
      headerMode: "float",
      headerStyle: {
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      },
      headerRight: walletCreated
        ? () => (
            <TouchableOpacity onPress={openModal} style={{ marginRight: 15 }}>
              <Icon
                name="information-circle-outline"
                size={28}
                color={isDarkMode ? "white" : "black"}
                paddingRight={15}
              />
            </TouchableOpacity>
          )
        : null,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Icon
            name="arrow-back"
            size={28}
            color={isDarkMode ? "white" : "black"}
            paddingLeft={15}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, walletCreated]);

  useEffect(() => {
    // Retrieve the secret key from secure storage when the component mounts
    const loadSecretKey = async () => {
      const storedSecretKey = await SecureStore.getItemAsync("stellarKey");
      if (storedSecretKey) {
        const keypair = StellarSdk.Keypair.fromSecret(storedSecretKey);
        setPublicKey(keypair.publicKey());
        setSecretKey(storedSecretKey);
        setWalletCreated(true);
      }
    };

    loadSecretKey();
  }, []);

  useEffect(() => {
    fetchCurrentPrice();
    fetchHistoricalData(); // Fetch historical data on component mount
  }, []);

  useEffect(() => {
    // Fetch the balance when the public key is available
    if (publicKey && walletCreated) {
      checkBalance();
      fetchTransactions();
    }
  }, [publicKey, walletCreated]);

  // Function to generate Stellar wallet (keypair)
  const generateStellarWallet = async () => {
    const keypair = StellarSdk.Keypair.random();
    setPublicKey(keypair.publicKey());
    setSecretKey(keypair.secret());
    setWalletCreated(true);

    // Save the secret key in secure storage
    await SecureStore.setItemAsync("stellarKey", keypair.secret());
    console.log("Public Key:", keypair.publicKey());
    console.log("Secret Key:", keypair.secret());
  };

  // Function to import existing wallet using secret key
  const importWallet = async () => {
    try {
      const keypair = StellarSdk.Keypair.fromSecret(importSecretKey);
      setPublicKey(keypair.publicKey());
      setSecretKey(importSecretKey);
      setWalletCreated(true);

      await SecureStore.setItemAsync("stellarKey", importSecretKey);
      console.log("Imported Public Key:", keypair.publicKey());
    } catch (error) {
      console.error("Error importing wallet:", error);
      alert("Invalid secret key. Please try again.");
    }
  };

  // Check account balance
  /**
   * Checks the balance of the Stellar account associated with the current public key.
   *
   * This function connects to the Stellar public network, loads the account details for the
   * current public key, and retrieves the balances for the account. It then formats the
   * balance information and updates the component state with the balance string.
   *
   * If an error occurs while fetching the balance, an error message is logged and an alert
   * is displayed to the user.
   */
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
        const formattedBalance = parseFloat(balance.balance).toFixed(2);
        balanceStr += `${formattedBalance} XLM`;

        fetchCurrentPrice();
      });
      setBalance(balanceStr);
    } catch (error) {
      console.error("Error fetching balance:", error);
      alert("Account not found. Make sure the public key is funded.");
    }
  };

  // Send transaction
  const sendTransaction = async () => {
    if (!destination || !amount) {
      alert("Please enter a destination and amount.");
      return;
    }

    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org"
    );
    const sourceKeys = StellarSdk.Keypair.fromSecret(secretKey);

    try {
      // Load the source account
      const sourceAccount = await server.loadAccount(sourceKeys.publicKey());

      let operation;
      try {
        // Try loading the destination account
        await server.loadAccount(destination);

        // If the account exists, use a payment operation
        operation = StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount: parseFloat(amount).toFixed(2), // Round amount to 2 decimal places
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If the account doesn't exist, use a createAccount operation
          operation = StellarSdk.Operation.createAccount({
            destination,
            startingBalance: parseFloat(amount).toFixed(2), // Set the initial balance
          });
        } else {
          console.error("Error checking destination account:", error);
          alert("Error checking destination account. Please try again.");
          return;
        }
      }

      // Build and sign the transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeys);

      // Submit the transaction
      const result = await server.submitTransaction(transaction);
      console.log("Transaction successful:", result);
      alert("Transaction successful!");
      setAmount("");
      setDestination("");
      checkBalance(); // Refresh balance after transaction
    } catch (error) {
      console.error("Error submitting transaction:", error);
      console.log("Error Message:", error.message);
      if (error.response) {
        console.log("Error Response Data:", error.response.data);
        alert(
          `Transaction failed: ${error.response.data.extras.result_codes.transaction}`
        );
      } else {
        alert("Transaction failed. Please check the details and try again.");
      }
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

  const fetchTransactions = async () => {
    const server = new StellarSdk.Horizon.Server(
      "https://horizon-testnet.stellar.org"
    );
    try {
      const payments = await server
        .payments()
        .forAccount(publicKey)
        .order("desc")
        .limit(10) // Limit the number of transactions displayed
        .call();

      const transactionHistory = payments.records.map((payment) => ({
        id: payment.id,
        amount: parseFloat(payment.amount).toFixed(2), // Limit to 2 decimal places
        asset: payment.asset_type === "native" ? "XLM" : payment.asset_code,
        type: payment.type,
        from: payment.from,
        to: payment.to,
        created_at: payment.created_at,
      }));

      setTransactions(transactionHistory);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions.");
    }
  };

  const copyToClipboardSecret = async () => {
    await Clipboard.setStringAsync(secretKey);
    alert("Copied to clipboard");
  };

  // Function to delete the wallet
  const deleteWallet = async () => {
    try {
      await SecureStore.deleteItemAsync("stellarKey");
      setPublicKey(null);
      setSecretKey(null);
      setWalletCreated(false);
      closeModal();
      console.log("Wallet deleted successfully");
    } catch (error) {
      console.log("Error deleting wallet:", error);
    }
  };

  const openExplore = async () => {
    try {
      Linking.openURL("https://testnet.lumenscan.io/account/" + publicKey);
    } catch (error) {
      console.log("https://testnet.lumenscan.io/account/" + publicKey);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coinlore.net/api/ticker/?id=89"
      );
      const price = parseFloat(response.data[0].price_usd); // Get price_usd and convert to float
      const percentageChange = parseFloat(response.data[0].percent_change_24h);

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
      // Replace with a suitable endpoint that provides historical data for Stellar
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/stellar/market_chart?vs_currency=usd&days=1"
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
                name={"Stellar"}
                ticker={"XLM"}
                visible={sendModalVisible}
                setVisible={setSendModalVisible}
                onClose={() => setSendModalVisible(false)}
                handleSendTransaction={sendTransaction}
                recipientAddress={destination}
                setRecipientAddress={setDestination}
                amountToSend={amount}
                setAmountToSend={setAmount}
              />
              <ReceiveModal
                name={"Stellar"}
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
                    <Text style={styles.modalTitle}>Secret Key</Text>
                    <Text selectable style={styles.secretKeyText}>
                      {secretKey}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => {
                        copyToClipboardSecret();
                      }}
                    >
                      Copy Secret Key
                    </Button>

                    <Button
                      style={styles.closeButton}
                      mode="contained"
                      onPress={closeModal}
                    >
                      Close
                    </Button>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={deleteWallet}
                    >
                      <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </Modal>

              {!walletCreated ? (
                <View style={styless.screen}>
                  <View style={styless.cardContainer}>
                    <Text style={styless.cardHeaderText}>
                      Import Existing Wallet
                    </Text>
                    <View style={styless.importSection}>
                      <Text style={styless.label}>Enter Secret Key</Text>
                      <TextInput
                        style={styless.input}
                        multiline={true}
                        placeholder="Secret Key"
                        placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                        value={importSecretKey}
                        onChangeText={setImportSecretKey}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Enter") {
                            importWallet(); // Trigger importWallet on "Enter"
                          }
                        }}
                        blurOnSubmit={true} // Dismiss keyboard after submission
                        returnKeyType="done" // Show "Done" on mobile keyboards
                      />
                      <TouchableOpacity
                        style={styless.importButton}
                        onPress={importWallet}
                      >
                        <Text style={styless.importButtonText}>
                          Import Wallet
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styless.cardContainer}>
                    <Text style={styless.cardHeaderText}>
                      Create New Wallet
                    </Text>
                    <TouchableOpacity
                      style={styless.actionButton}
                      onPress={generateStellarWallet}
                    >
                      <Text style={styless.actionButtonText}>
                        Generate Stellar Wallet
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {balance && (
                    <View style={styles.balanceInfo}>
                      <Text selectable style={styles.balanceText}>
                        {balance}
                      </Text>
                      <Text style={styles.fiatBalanceText}>
                        ${fiatBalance ? fiatBalance : "0.00"}
                      </Text>
                    </View>
                  )}
                  {/* Action Buttons */}
                  <WalletActions
                    isDarkMode={isDarkMode}
                    setSendModalVisible={setSendModalVisible}
                    setReceiveModalVisible={setReceiveModalVisible}
                    openExplore={openExplore}
                  />

                  <StellarPriceDetail
                    name={"Stellar"}
                    price={price}
                    change={priceChange}
                    percentageChange={percentageChange}
                    chartData={chartData}
                  />

                  {transactions.length > 0 && (
                    <View style={styles.transactionHistory}>
                      <Text
                        style={[
                          styles.transactionTitle,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        Transaction History
                      </Text>
                      {transactions.map((tx) => {
                        const isReceived = tx.to === publicKey;
                        return (
                          <View
                            key={tx.id}
                            style={[
                              styles.transactionItem,
                              isDarkMode && styles.darkButton,
                              isReceived
                                ? styles.receivedTransaction
                                : styles.sentTransaction,
                            ]}
                          >
                            <Text style={styles.transactionDate}>
                              {new Date(tx.created_at).toLocaleDateString()}
                            </Text>
                            <View style={styles.transactionContent}>
                              <Text
                                style={[
                                  styles.transactionType,
                                  isDarkMode && styles.darkText,
                                ]}
                              >
                                {isReceived ? "Received" : "Sent"}
                              </Text>
                              <Text
                                style={[
                                  styles.transactionAmount,
                                  isReceived
                                    ? styles.amountReceived
                                    : styles.amountSent,
                                ]}
                              >
                                {isReceived ? `+${tx.amount}` : `-${tx.amount}`}{" "}
                                {tx.asset}
                              </Text>
                            </View>
                            <Text style={styles.transactionAddress}>
                              {isReceived ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default StellarScreen;

export const styless = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    paddingTop: 140,
    justifyContent: "center",
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    alignItems: "center",
    backgroundColor: "#333",
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#296fc5",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  importSection: {
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  label: {
    fontWeight: "500",
    fontSize: 16,
    color: "lightgray",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    width: "100%",
    height: 80,
    backgroundColor: "#f8f8f8",
  },
  importButton: {
    marginTop: 10,
    backgroundColor: "#296fc5",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  importButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
