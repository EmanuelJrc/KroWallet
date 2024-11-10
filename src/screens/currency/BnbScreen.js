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
import { ThemeContext } from "../../utils/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import useModalAnimation from "../../hooks/useModalAnimation";
import WalletActions from "../../components/WalletActions";
import {
  generateEthereumWallet,
  getEthereumBalance,
  sendEthereumTransaction,
} from "../../services/ethereum/ethereumWallet";
import { saveToSecureStore, getFromSecureStore } from "../../utils/secureStore";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import ReceiveNano from "../../components/ReceiveNano";
import SendNano from "../../components/SendNano";
import WalletTransactionHistory from "../../services/bnb/transactionList";
import axios from "axios";
import GradientBackground from "../../components/GradientBackground";
import StellarPriceDetail from "../../components/StellarPriceDetail";

const BnbScreen = () => {
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [balance, setBalance] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [importKey, setImportKey] = useState("");
  const [fiatBalance, setFiatBalance] = useState(null);
  const [price, setPrice] = useState(null);
  const [percentageChange, setPercentageChange] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [provider, setProvider] = useState(null);
  const [chartData, setChartData] = useState([]);

  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  const { modalVisible, fadeAnim, translateYAnim, openModal, closeModal } =
    useModalAnimation();

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
            source={require("../../../assets/bnb.png")} // Update the path to your image
            style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
          />
          <Text
            style={{
              color: isDarkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            BNB
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
    loadOrCreateWallet();
  }, []);

  // Modify the provider initialization and balance fetching
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const initProvider = new ethers.JsonRpcProvider(
          `https://bsc-mainnet.infura.io/v3/${process.env.EXPO_PUBLIC_ETHER_API_KEY}`
        );

        // Test the provider connection
        await initProvider.getNetwork();

        setProvider(initProvider);

        // Only fetch balance if we have both a provider and an address
        if (address) {
          await fetchBalance(address, initProvider);
        }
      } catch (error) {
        console.error("Error initializing provider:", error);
        Alert.alert(
          "Connection Error",
          "Failed to connect to Binance network. Please check your internet connection and API key."
        );
      }
    };

    initializeProvider();
  }, [address]); // Depend on address changes

  // Function to load wallet if it exists or create a new one if it doesn't
  const loadOrCreateWallet = async () => {
    const storedMnemonic = await SecureStore.getItemAsync("bnbMnemonic");
    const storedAddress = await SecureStore.getItemAsync("bnbAddress");
    const storedPrivateKey = await SecureStore.getItemAsync("bnbPrivateKey");

    if (storedMnemonic && storedAddress && storedPrivateKey) {
      // Wallet exists, load it
      setMnemonic(storedMnemonic);
      setAddress(storedAddress);
      setPrivateKey(storedPrivateKey);
      setWalletCreated(true);
      console.log("Loaded existing wallet.");
    } else {
      // No wallet found, create a new one
      setWalletCreated(false);
    }
  };

  const deleteWallet = async () => {
    try {
      await SecureStore.deleteItemAsync("bnbMnemonic");
      await SecureStore.deleteItemAsync("bnbAddress");
      await SecureStore.deleteItemAsync("bnbPrivateKey");
      setMnemonic(null);
      setPrivateKey(null);
      setAddress(null);
      setWalletCreated(false);
      console.log("Wallet deleted successfully");
    } catch (error) {
      console.log("Error deleting wallet:", error);
    }
  };

  useEffect(() => {
    // Initialize the provider (using ethers default provider)
    const initProvider = new ethers.JsonRpcProvider(
      "https://bsc-mainnet.infura.io/v3/" +
        process.env.EXPO_PUBLIC_ETHER_API_KEY // replace with your own Infura/Alchemy endpoint
    );
    setProvider(initProvider);

    // If you already have an address, fetch the balance
    if (address) {
      fetchBalance(address, initProvider);
    }
  }, [address]);

  const fetchBalance = async (walletAddress, providerInstance) => {
    try {
      // Verify we have both required parameters
      if (!walletAddress || !providerInstance) {
        console.error("Missing wallet address or provider instance");
        return;
      }

      // Ensure provider is ready by testing connection
      await providerInstance.getNetwork();

      const balanceWei = await providerInstance.getBalance(walletAddress);
      const balanceInEth = ethers.formatEther(balanceWei);
      setBalance(balanceInEth);
      await fetchCurrentPrice();
    } catch (error) {
      console.error("Error fetching balance:", error);
      Alert.alert(
        "Balance Error",
        "Failed to fetch wallet balance. Please try again later."
      );
    }
  };

  // Function to create a wallet using ethers and save details securely
  const createAndSaveWallet = async () => {
    const wallet = ethers.Wallet.createRandom();
    const walletMnemonic = wallet.mnemonic.phrase;
    const walletAddress = wallet.address;
    const walletPrivateKey = wallet.privateKey;

    setMnemonic(walletMnemonic);
    setAddress(walletAddress);
    setPrivateKey(walletPrivateKey);
    setWalletCreated(true);

    await saveWalletToSecureStore(
      walletMnemonic,
      walletAddress,
      walletPrivateKey
    );
  };

  const importWallet = async () => {
    try {
      const mnemonic = ethers.Mnemonic.fromPhrase(importKey);
      // Derive wallet from mnemonic
      const importedWallet = ethers.HDNodeWallet.fromMnemonic(
        mnemonic,
        `m/44'/60'/0'/0/0`
      );

      setMnemonic(importKey);
      setAddress(importedWallet.address);
      setPrivateKey(importedWallet.privateKey);
      setWalletCreated(true);
      console.log("Imported Wallet:", importedWallet);
      console.log("Imported Wallet Address:", importedWallet.address);
      console.log("Imported Wallet Private Key:", importedWallet.privateKey);
      console.log("Imported Wallet Mnemonic:", importedWallet.mnemonic.phrase);
      await saveWalletToSecureStore(
        importKey,
        importedWallet.address,
        importedWallet.privateKey
      );
    } catch (error) {
      console.log(importKey);
      console.error("Error importing wallet:", error);
      Alert.alert(
        "Invalid mnemonic",
        "Please enter a valid mnemonic to import a wallet."
      );
    }
  };

  // Function to save wallet details to SecureStore
  const saveWalletToSecureStore = async (mnemonic, address, privateKey) => {
    try {
      await SecureStore.setItemAsync("bnbMnemonic", mnemonic);
      await SecureStore.setItemAsync("bnbAddress", address);
      await SecureStore.setItemAsync("bnbPrivateKey", privateKey);
      console.log("Wallet details saved securely.");
    } catch (error) {
      console.error("Error saving wallet:", error);
    }
  };

  // Function to handle the pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!provider) {
        const newProvider = new ethers.JsonRpcProvider(
          `https://bsc-mainnet.infura.io/v3/${process.env.EXPO_PUBLIC_ETHER_API_KEY}`
        );
        await newProvider.getNetwork(); // Test connection
        setProvider(newProvider);
        await fetchBalance(address, newProvider);
      } else {
        await fetchBalance(address, provider);
        await fetchHistoricalData();
      }
      await fetchCurrentPrice();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert(
        "Refresh Error",
        "Failed to refresh wallet data. Please try again later."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const openExplore = async () => {
    try {
      Linking.openURL("https://bscscan.com/address/" + address);
    } catch (error) {
      console.log("https://bscscan.com/address/" + address);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coinlore.net/api/ticker/?id=2710"
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
      // Replace with a suitable endpoint that provides historical data for Ethereum
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=1"
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

  useEffect(() => {
    if (walletCreated) {
      fetchCurrentPrice();
      fetchHistoricalData;
      fetchBalance(address, provider);
    }
  }, [walletCreated]);

  useEffect(() => {
    const initializeWallet = async () => {
      // Check if privateKey is set
      if (!privateKey) {
        console.error("No private key found.");
        return;
      }
      try {
        const provider = new ethers.JsonRpcProvider(
          "https://bsc-mainnet.infura.io/v3/" +
            process.env.EXPO_PUBLIC_ETHER_API_KEY // replace with your own Infura/Alchemy endpoint
        );
        const initializedWallet = new ethers.Wallet(privateKey, provider);
        setWallet(initializedWallet);
        console.log("Wallet initialized:", initializedWallet);
        console.log(provider);
      } catch (error) {
        console.error("Error initializing wallet:", error);
      }
    };
    initializeWallet();
  }, [privateKey]);

  async function sendBnb(wallet, toAddress, amountInEther) {
    if (!wallet) {
      throw new Error("Wallet is not initialized");
    }

    if (!toAddress) {
      throw new Error("Recipient address is required");
    }

    if (
      !amountInEther ||
      isNaN(parseFloat(amountInEther)) ||
      parseFloat(amountInEther) <= 0
    ) {
      throw new Error("Invalid amount specified");
    }

    try {
      // Ensure a valid address format
      if (!ethers.isAddress(toAddress)) {
        throw new Error("Invalid Binance address");
      }

      // Convert the amount from Ether to Wei
      const amountInWei = ethers.parseEther(amountInEther);

      // Check wallet balance
      const balance = await wallet.provider.getBalance(wallet.address);
      console.log(
        "Current wallet balance:",
        ethers.formatEther(balance),
        "BNB"
      );

      // Estimate gas
      const gasEstimate = await wallet.provider.estimateGas({
        to: toAddress,
        value: amountInWei,
      });

      const feeData = await wallet.provider.getFeeData();
      const estimatedGasCost = gasEstimate * feeData.gasPrice;
      const totalCost = estimatedGasCost + amountInWei;

      // Check if wallet has enough balance including gas
      if (balance < totalCost) {
        const requiredBalance = ethers.formatEther(totalCost);
        const currentBalance = ethers.formatEther(balance);
        throw new Error(
          `Insufficient funds. Required: ${requiredBalance} BNB (including gas), Available: ${currentBalance} BNB`
        );
      }

      // Define transaction with gas parameters
      const tx = {
        to: toAddress,
        value: amountInWei,
        gasLimit: gasEstimate,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      };

      console.log("Sending transaction with parameters:", {
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        maxFeePerGas: tx.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
      });

      // Send transaction
      const transactionResponse = await wallet.sendTransaction(tx);
      console.log("Transaction sent. Hash:", transactionResponse.hash);

      // Wait for confirmation with timeout
      const receipt = await Promise.race([
        transactionResponse.wait(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Transaction confirmation timeout")),
            60000
          )
        ),
      ]);

      console.log("Transaction confirmed in block:", receipt.blockNumber);
      return receipt;
    } catch (error) {
      // Handle specific error types
      let errorMessage = "Transaction failed: ";

      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage += "Insufficient funds to cover transaction and gas fees";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage +=
          "Network connection error. Please check your internet connection";
      } else if (error.code === "NONCE_EXPIRED") {
        errorMessage += "Transaction nonce has expired. Please try again";
      } else if (error.code === "REPLACEMENT_UNDERPRICED") {
        errorMessage += "Gas price too low to replace pending transaction";
      } else if (error.message.includes("timeout")) {
        errorMessage +=
          "Transaction confirmation timed out. Check explorer for status";
      } else {
        errorMessage += error.message;
      }

      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Modified transaction handler
  const handleSendBnbTransaction = async () => {
    console.log("Initiating transaction...");
    console.log("Recipient:", recipient);
    console.log("Amount:", amount, "BNB");

    try {
      if (!wallet?.provider) {
        throw new Error("Wallet is not properly initialized");
      }

      // Pre-transaction validation
      if (!recipient || !amount) {
        const missingParams = [];
        if (!recipient) missingParams.push("recipient address");
        if (!amount) missingParams.push("amount");

        const errorMessage = `Missing required parameters: ${missingParams.join(
          ", "
        )}`;
        console.error(errorMessage);
        Alert.alert("Error", errorMessage);
        return;
      }
      // Show pending transaction alert
      Alert.alert(
        "Transaction Pending",
        "Your transaction is being processed. Please wait..."
      );

      const receipt = await sendBnb(wallet, recipient, amount);

      // Show success alert with transaction details
      Alert.alert(
        "Transaction Successful",
        `Transaction confirmed in block ${receipt.blockNumber}\nHash: ${receipt.hash}`
      );

      // Refresh balance after successful transaction
      await fetchBalance(wallet.address, wallet.provider);

      // Log transaction details
      console.log("Transaction Details:", {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed.toString(),
      });
    } catch (error) {
      console.error("Transaction Error:", error);
      Alert.alert("Transaction Failed", error.message);
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
              <SendNano
                name={"BNB"}
                ticker={"BNB"}
                visible={sendModalVisible}
                setVisible={setSendModalVisible}
                onClose={() => setSendModalVisible(false)}
                handleSendTransaction={handleSendBnbTransaction}
                recipientAddress={recipient}
                setRecipientAddress={setRecipient}
                amountToSend={amount}
                setAmountToSend={setAmount}
              />
              <ReceiveNano
                name={"BNB"}
                visible={receiveModalVisible}
                onClose={() => setReceiveModalVisible(false)}
                address={address}
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
                        copyToClipboardSecret();
                      }}
                    />
                    <Text style={styles.modalTitle}>Private Key</Text>
                    <Text selectable style={styles.secretKeyText}>
                      {privateKey}
                    </Text>
                    <Button
                      title="Copy Private Key"
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
                    style={[styles.button, { marginTop: 150 }]}
                    onPress={createAndSaveWallet}
                  >
                    <Text style={styles.buttonText}>Generate BNB Wallet</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>Or Import Existing Wallet</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Mnemonic"
                    value={importKey}
                    onChangeText={setImportKey}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={importWallet}
                  >
                    <Text style={styles.buttonText}>Import Wallet</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.balanceInfo}>
                    <Text selectable style={styles.balanceText}>
                      {Number(balance).toFixed(6)} BNB
                    </Text>
                    <Text style={styles.fiatBalanceText}>
                      ${fiatBalance ? fiatBalance : "0.00"}
                    </Text>
                  </View>
                  {/* Action Buttons */}
                  <WalletActions
                    isDarkMode={isDarkMode}
                    setSendModalVisible={setSendModalVisible}
                    setReceiveModalVisible={setReceiveModalVisible}
                    openExplore={openExplore}
                  />
                  <StellarPriceDetail
                    name={"BNB"}
                    price={price}
                    change={priceChange}
                    percentageChange={percentageChange}
                    chartData={chartData}
                  />
                  <WalletTransactionHistory address={address} />
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

export default BnbScreen;
