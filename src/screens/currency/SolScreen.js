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
import ReceiveNano from "../../components/ReceiveNano";
import { ThemeContext } from "../../utils/ThemeContext";
import SendNano from "../../components/SendNano";
import WalletActions from "../../components/WalletActions";
import GradientBackground from "../../components/GradientBackground";

export default function SolScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [fiatBalance, setFiatBalance] = useState(null);
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

              <SendNano
                name={"Solana"}
                visible={sendModalVisible}
                setVisible={setSendModalVisible}
                onClose={() => setSendModalVisible(false)}
                handleSendTransaction={handleSendTransaction}
                recipientAddress={recipient}
                setRecipientAddress={setRecipient}
                amountToSend={amount.toString()}
                setAmountToSend={setAmount}
              />

              <ReceiveNano
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
                  <Button
                    title="Generate New Wallet"
                    onPress={handleCreateWallet}
                  />

                  <Text style={styles.label}>
                    Or import an existing wallet:
                  </Text>
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
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
