// shim.js
import { Buffer } from "@craftzdog/react-native-buffer";
import "react-native-get-random-values";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
getRandomValues = expoCryptoGetRandomValues;

// Make sure Buffer is defined globally
global.Buffer = Buffer;

// BitcoinWallet.js
import "../../../shim";
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Image,
} from "react-native";
import ECPairFactory from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import * as Clipboard from "expo-clipboard";
import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as SecureStore from "expo-secure-store";
import WalletActions from "../../components/WalletActions";
import GradientBackground from "../../components/GradientBackground";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../utils/ThemeContext";
import useModalAnimation from "../../hooks/useModalAnimation";
import Icon from "react-native-vector-icons/Ionicons";
import { Button } from "react-native-paper";
import ReceiveNano from "../../components/ReceiveNano";

const BitcoinWallet = () => {
  const navigation = useNavigation();
  const { modalVisible, fadeAnim, translateYAnim, openModal, closeModal } =
    useModalAnimation();

  const { isDarkMode } = useContext(ThemeContext);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  const [walletData, setWalletData] = useState({
    p2shSegwitAddress: "", // P2SH-P2WPKH (Compatible SegWit)
    nativeSegwitAddress: "", // P2WPKH (Native SegWit)
    mnemonic: "",
    publicKey: "",
    privateKey: "",
    wif: "",
  });
  const [importKey, setImportKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWalletGenerated, setIsWalletGenerated] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showWIF, setShowWIF] = useState(false);
  const bip32 = BIP32Factory(ecc);

  // Save wallet data to secure storage
  const saveWalletToSecureStore = async (walletData) => {
    try {
      await SecureStore.setItemAsync("walletData", JSON.stringify(walletData));
      console.log("Wallet saved to secure store!");
    } catch (error) {
      console.error("Error saving wallet data:", error);
    }
  };

  // Function to load wallet data from secure storage
  const loadWalletFromSecureStore = async () => {
    try {
      const walletDataString = await SecureStore.getItemAsync("walletData");
      if (walletDataString) {
        const loadedWalletData = JSON.parse(walletDataString);
        setWalletData(loadedWalletData);
        setIsWalletGenerated(true);
        console.log("Wallet loaded from secure store!");
      } else {
        console.log("No wallet found in secure storage.");
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const importWallet = async () => {
    setLoading(true);

    try {
      let keyPair;
      let publicKey;
      let privateKey;
      let wif = "";
      let mnemonic = "";

      // Check if the importKey is a valid mnemonic (12 words)
      if (bip39.validateMnemonic(importKey)) {
        // If it's a valid mnemonic, convert it to seed
        mnemonic = importKey;
        const seed = await bip39.mnemonicToSeed(mnemonic);

        // Create HD wallet from the seed
        const root = bip32.fromSeed(seed);
        const child = root.derivePath("m/84'/0'/0'/0/0"); // BIP44 path

        // Get private key and public key
        privateKey = child.privateKey.toString("hex");
        publicKey = child.publicKey.toString("hex");

        // Generate SegWit address (P2WPKH) (BlueWallet expects this)
        const nativeSegwit = bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network: bitcoin.networks.bitcoin,
        });

        // Generate WIF (Wallet Import Format)
        wif = child.toWIF();

        const wallet = {
          p2shSegwitAddress: "", // Clear Compatible SegWit
          nativeSegwitAddress: nativeSegwit.address, // Native SegWit
          mnemonic,
          publicKey,
          privateKey,
          wif,
        };

        // Update wallet data state
        setWalletData(wallet);
        setIsWalletGenerated(true);

        // Save wallet to secure storage
        await saveWalletToSecureStore(wallet);

        Alert.alert(
          "Wallet Imported Successfully",
          "Your wallet has been loaded from the mnemonic."
        );
      } else if (importKey.length === 64) {
        // If the importKey is a hex private key, derive the key pair from it
        keyPair = ECPairFactory(ecc).fromPrivateKey(
          Buffer.from(importKey, "hex")
        );
        publicKey = keyPair.publicKey.toString("hex");
        privateKey = keyPair.privateKey.toString("hex");
        wif = keyPair.toWIF();

        // Generate SegWit address (P2WPKH) (BlueWallet expects this)
        const nativeSegwit = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: bitcoin.networks.bitcoin,
        });

        // Update wallet data state
        setWalletData({
          p2shSegwitAddress: "", // Clear Compatible SegWit
          nativeSegwitAddress: nativeSegwit.address, // Native SegWit
          publicKey,
          privateKey,
          wif,
        });

        setIsWalletGenerated(true);

        await saveWalletToSecureStore({
          mnemonic,
          publicKey,
          privateKey,
          wif,
          p2shSegwitAddress: "", // Clear Compatible SegWit if needed
          nativeSegwitAddress: nativeSegwit.address,
        });

        Alert.alert(
          "Wallet Imported Successfully",
          "Your wallet has been loaded from the private key."
        );
      } else {
        // If the input is not a valid mnemonic or private key, check if it's a WIF
        try {
          // Try to import using WIF
          keyPair = ECPairFactory(ecc).fromWIF(
            importKey,
            bitcoin.networks.bitcoin
          );
          publicKey = keyPair.publicKey.toString("hex");
          privateKey = keyPair.privateKey.toString("hex");
          wif = importKey; // The importKey itself is the WIF

          // Generate SegWit address (P2WPKH) (BlueWallet expects this)
          const nativeSegwit = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network: bitcoin.networks.bitcoin,
          });

          // Update wallet data state
          setWalletData({
            p2shSegwitAddress: "", // Clear Compatible SegWit
            nativeSegwitAddress: nativeSegwit.address, // Native SegWit
            publicKey,
            privateKey,
            wif,
          });

          setIsWalletGenerated(true);

          await saveWalletToSecureStore({
            mnemonic,
            publicKey,
            privateKey,
            wif,
            p2shSegwitAddress: "", // Clear Compatible SegWit if needed
            nativeSegwitAddress: nativeSegwit.address,
          });

          Alert.alert(
            "Wallet Imported Successfully",
            "Your wallet has been loaded from the WIF."
          );
        } catch (error) {
          // Handle invalid WIF error
          Alert.alert("Invalid WIF", "The provided WIF is invalid.");
          console.error("Error importing WIF:", error);
        }
      }
    } catch (error) {
      console.error("Error importing wallet:", error);
      Alert.alert("Error", "Failed to import wallet. Check your key format.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert(
        "Copied Successfully",
        `${label} has been copied to clipboard.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
      console.error("Clipboard error:", error);
    }
  };

  const generateNativeSegWit = async () => {
    setLoading(true);
    try {
      // Generate a mnemonic (12 words)
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);

      // Create an HD wallet from the seed
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/84'/0'/0'/0/0");

      // Derive the private key and public key
      const privateKey = child.privateKey.toString("hex");
      const publicKey = child.publicKey.toString("hex");

      // Generate Native SegWit address (P2WPKH)
      const nativeSegwit = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.bitcoin,
      });

      const wallet = {
        p2shSegwitAddress: "", // Clear Compatible SegWit
        nativeSegwitAddress: nativeSegwit.address, // Native SegWit
        mnemonic,
        publicKey,
        privateKey,
        wif: "", // WIF is not needed for mnemonic-based wallet generation
      };

      setWalletData(wallet);
      setIsWalletGenerated(true);

      // Save wallet to secure storage
      await saveWalletToSecureStore(wallet);

      Alert.alert(
        "Native SegWit Wallet Generated Successfully",
        "This is the best practice for low transaction fees with the latest wallet compatibility."
      );
    } catch (error) {
      console.error("Error generating Native SegWit wallet:", error);
      Alert.alert("Error", "Failed to generate wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateCompatibleSegWit = async () => {
    setLoading(true);
    try {
      const ECPair = ECPairFactory(ecc);

      // Generate random bytes using react-native-get-random-values
      const randomBytes = new Uint8Array(32);
      getRandomValues(randomBytes);

      // Create key pair from random bytes
      const keyPair = ECPair.fromPrivateKey(Buffer.from(randomBytes));

      // Get public and private keys
      const publicKey = keyPair.publicKey.toString("hex");
      const privateKey = keyPair.privateKey.toString("hex");
      const wif = keyPair.toWIF();

      // Generate Compatible SegWit address (P2SH-P2WPKH)
      const p2shSegwit = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: bitcoin.networks.bitcoin,
        }),
      });

      // Update wallet data state
      setWalletData({
        p2shSegwitAddress: p2shSegwit.address, // Compatible SegWit
        nativeSegwitAddress: "", // Clear Native SegWit
        publicKey,
        privateKey,
        wif,
        mnemonic: "",
      });

      setIsWalletGenerated(true);

      await saveWalletToSecureStore({
        mnemonic,
        publicKey,
        privateKey,
        wif: "", // No WIF needed for mnemonic-based wallets
        p2shSegwitAddress: "", // Clear Compatible SegWit if needed
        nativeSegwitAddress: nativeSegwit.address,
      });

      Alert.alert(
        "Compatible SegWit Wallet Generated Successfully",
        "This address format is widely supported by older wallets."
      );
    } catch (error) {
      console.error("Error generating Compatible SegWit wallet:", error);
      Alert.alert("Error", "Failed to generate wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete wallet data from secure storage
  const deleteWalletFromSecureStore = async () => {
    try {
      await SecureStore.deleteItemAsync("walletData");
      console.log("Wallet deleted from secure store!");
    } catch (error) {
      console.error("Error deleting wallet data:", error);
    }
  };

  const showSecurityAlert = () => {
    Alert.alert(
      "Security Warning",
      "• Never share your private key or WIF with anyone\n" +
        "• Store your keys in a secure location\n" +
        "• Make sure to backup your wallet information\n" +
        "• Consider using a hardware wallet for large amounts",
      [{ text: "I Understand", style: "default" }]
    );
  };

  const CopyButton = ({ text, label }) => (
    <TouchableOpacity
      style={styles.copyButton}
      onPress={() => copyToClipboard(text, label)}
    >
      <Text style={styles.copyButtonText}>Copy</Text>
    </TouchableOpacity>
  );

  const showTextPIPI = () => {
    Alert.alert(
      "Text PIPI",
      "• Never share your private key or WIF with anyone\n" +
        "• Store your keys in a secure location\n" +
        "• Make sure to backup your wallet information\n" +
        "• Consider using a hardware wallet for large amounts",
      [{ text: "I Understand", style: "default" }]
    );
  };

  // Load the wallet data from secure storage when the component mounts
  useEffect(() => {
    setLoading(true);
    loadWalletFromSecureStore();
  }, []);

  // Set up header with the info button and conditional display
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {isWalletGenerated && (
            <Image
              source={require("../../../assets/bitcoin.png")} // Update the path to your image
              style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
            />
          )}
          <Text
            style={{
              color: isDarkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Bitcoin
          </Text>
        </View>
      ),
      headerShown: true,
      headerTransparent: true,
      headerMode: "float",
      headerStyle: {
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      },
      headerRight: isWalletGenerated
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
  }, [navigation, isWalletGenerated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F7931A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWalletGenerated && (
        <>
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
          <GradientBackground isDarkMode={true} />
        </>
      )}
      <SafeAreaView style={styles.container}>
        {isWalletGenerated ? (
          <Animated.ScrollView
            style={{ flex: 1 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false } // Use native driver for better performance
            )}
            scrollEventThrottle={16} // Update every 16ms
            // refreshControl={
            //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            // }
          >
            <View style={styles.testContainer}>
              <View style={styles.balanceInfo}>
                <Text selectable style={styles.balanceText}>
                  {/* {balance} */} 0.00 BTC
                </Text>
                <Text style={styles.fiatBalanceText}>
                  {/* ${fiatBalance ? fiatBalance : "0.00"} */} $0.00
                </Text>
              </View>
              <ReceiveNano
                name={"Bitcoin"}
                visible={receiveModalVisible}
                onClose={() => setReceiveModalVisible(false)}
                address={walletData.nativeSegwitAddress}
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
                      {walletData.mnemonic}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => {
                        copyToClipboard(walletData.mnemonic, "Mnemonic");
                      }}
                    >
                      Copy Mnemonic
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
                      onPress={() => {
                        deleteWalletFromSecureStore(); // Delete wallet data from secure storage
                        setIsWalletGenerated(false); // Reset wallet generation state
                        setWalletData({}); // Clear wallet data state
                      }}
                    >
                      <Text style={styles.deleteButtonText}>Delete Wallet</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </Modal>
              {/* Action Buttons */}
              <WalletActions
                isDarkMode={showTextPIPI}
                setSendModalVisible={showTextPIPI}
                setReceiveModalVisible={setReceiveModalVisible}
                openExplore={showTextPIPI}
              />

              <Text style={styles.testContainer.label}>
                Wallet Successfully Generated:
              </Text>

              <Text style={styles.testContainer.label}>
                Native SegWit Address:
              </Text>
              <Text style={styles.testContainer.text}>
                {walletData.nativeSegwitAddress}
              </Text>

              <Text style={styles.testContainer.label}>
                Compatible SegWit Address:
              </Text>
              <Text style={styles.testContainer.text}>
                {walletData.p2shSegwitAddress}
              </Text>

              <Text style={styles.testContainer.label}>Mnemonic:</Text>
              <Text style={styles.testContainer.text}>
                {walletData.mnemonic}
              </Text>

              <Text style={styles.testContainer.label}>Private Key:</Text>
              <Text style={styles.testContainer.text}>
                {walletData.privateKey}
              </Text>

              <Text style={styles.testContainer.label}>WIF:</Text>
              <Text style={styles.testContainer.text}>{walletData.wif}</Text>

              <Button
                title="Clear Wallet Data"
                onPress={() => {
                  SecureStore.deleteItemAsync("walletData");
                  setIsWalletGenerated(false);
                  setWalletData({});
                }}
              />
            </View>
          </Animated.ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.importContainer}>
              <Text style={styles.title}>Bitcoin SegWit Wallet Generator</Text>

              <View style={styles.content}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Compatible SegWit Address (P2SH-P2WPKH):
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={walletData.p2shSegwitAddress}
                    editable={false}
                    selectTextOnFocus
                    placeholder="Will start with '3'"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>
                      WIF (Wallet Import Format):
                    </Text>
                    <TouchableOpacity onPress={() => setShowWIF(!showWIF)}>
                      <Text style={styles.toggleButton}>
                        {showWIF ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.inputWithButton]}
                      value={walletData.wif}
                      editable={false}
                      secureTextEntry={!showWIF}
                      selectTextOnFocus
                    />
                    {walletData.wif.length > 0 && (
                      <CopyButton text={walletData.wif} label="WIF" />
                    )}
                  </View>
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={generateNativeSegWit}
                  >
                    <Text style={styles.buttonText}>
                      Generate Native SegWit Address
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.securityText}>
                    ℹ️ Native SegWit (bc1) addresses offer the lowest
                    transaction fees
                  </Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={generateCompatibleSegWit}
                  >
                    <Text style={styles.buttonText}>
                      Generate Compatible SegWit Address
                    </Text>
                  </TouchableOpacity>

                  {/* Import wallet section */}
                  <View style={styles.importContainer}>
                    <Text style={styles.label}>
                      Import Private Key / WIF / Mnemonic:
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={importKey}
                      onChangeText={setImportKey}
                      placeholder="Enter hex, WIF, or mnemonic"
                    />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={importWallet}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>Import Wallet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  importContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  toggleButton: {
    color: "#F7931A", // BCH green
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  inputWithButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  copyButton: {
    backgroundColor: "#F7931A", // BCH green
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  copyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#F7931A", // BCH green
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  exportButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  securityText: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
    fontSize: 14,
  },

  testContainer: {
    flex: 1,
    padding: 16,
    color: "white",
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      color: "white",
    },
    text: {
      fontSize: 16,
      color: "white",
    },
  },
  balanceInfo: {
    marginTop: 20,
    marginBottom: 20,
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
    marginTop: 50,
    marginBottom: 15,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
  },
});

export default BitcoinWallet;
