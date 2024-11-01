import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  Button,
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
import SendNano from "../../components/SendNano";
import ReceiveNano from "../../components/ReceiveNano";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import StellarPriceDetail from "../../components/StellarPriceDetail";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [chartData, setChartData] = useState([]);

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

  // Fade and slide animations for opening the modal
  const openModal = () => {
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
      headerStyle: {
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      },
      headerRight: () => (
        <TouchableOpacity onPress={openModal} style={{ marginRight: 15 }}>
          <Icon
            name="information-circle-outline"
            size={28}
            color={isDarkMode ? "white" : "black"}
            paddingRight={15}
          />
        </TouchableOpacity>
      ),
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
  }, [navigation]);

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

  const copyToClipboardPublic = async () => {
    await Clipboard.setStringAsync(publicKey);
    alert("Copied to clipboard");
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
      <LinearGradient
        colors={
          isDarkMode
            ? ["#296fc5", "#3d3d3d", "#3d3d3d", "#333333"]
            : ["#296fc5", "#5d97dd", "#ffffff", "#f0f0f0"]
        }
        style={StyleSheet.absoluteFill}
      />
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
              <SendNano
                name={"Stellar"}
                visible={sendModalVisible}
                onClose={() => setSendModalVisible(false)}
                handleSendTransaction={sendTransaction}
                recipientAddress={destination}
                setRecipientAddress={setDestination}
                amountToSend={amount}
                setAmountToSend={setAmount}
              />

              <ReceiveNano
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
                      title="Copy Secret Key"
                      onPress={() => {
                        copyToClipboardSecret();
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

              {!walletCreated ? (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={generateStellarWallet}
                  >
                    <Text style={styles.buttonText}>
                      Generate Stellar Wallet
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.importSection}>
                    <Text style={styles.label}>Import Existing Wallet</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Secret Key"
                      value={importSecretKey}
                      onChangeText={setImportSecretKey}
                    />
                    <Button title="Import Wallet" onPress={importWallet} />
                  </View>
                </>
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
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isDarkMode && styles.darkButton,
                      ]}
                      onPress={() => setSendModalVisible(true)}
                    >
                      <Icon
                        name="send"
                        size={24}
                        color={isDarkMode ? "white" : "black"}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        Send
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isDarkMode && styles.darkButton,
                      ]}
                      onPress={() => setReceiveModalVisible(true)}
                    >
                      <Icon
                        name="download"
                        size={24}
                        color={isDarkMode ? "white" : "black"}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        Receive
                      </Text>
                      {/* Modal to display QR code and address */}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isDarkMode && styles.darkButton,
                      ]}
                    >
                      <Icon
                        name="cash-outline"
                        size={24}
                        color={isDarkMode ? "white" : "black"}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        Buy
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isDarkMode && styles.darkButton,
                      ]}
                      onPress={openExplore}
                    >
                      <Icon
                        name="exit"
                        size={24}
                        color={isDarkMode ? "white" : "black"}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          isDarkMode && styles.darkText,
                        ]}
                      >
                        View
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <StellarPriceDetail
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

                  {/* Add more buttons or components for transactions here */}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  secretKeyText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceInfo: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "black",
    fontWeight: "regular",
    fontSize: 16,
    paddingTop: 5,
  },
  darkText: {
    color: "white",
  },
  transactionHistory: {
    marginTop: 20,
    width: "100%",
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  transactionItem: {
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountReceived: {
    color: "green",
  },
  amountSent: {
    color: "red",
  },
  transactionAddress: {
    fontSize: 14,
    color: "#6a6a6a",
    marginTop: 5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: "#d9d9d9",
    width: 70, // Set fixed width
    height: 70, // Set fixed height
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  darkButton: {
    color: "#fff",
    backgroundColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0078FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  walletInfo: {
    marginTop: 30,
    width: "100%",
  },
  balanceText: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  fiatBalanceText: {
    color: "#adadad",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    width: "80%",
    height: 100,
  },
});

export default StellarScreen;
