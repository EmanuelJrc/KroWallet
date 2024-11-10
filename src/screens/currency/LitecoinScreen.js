// shim.js remains the same
import "../../../shim";
import React, { useState } from "react";
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
} from "react-native";
import ECPairFactory from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";

// Define Litecoin network parameters
const litecoin = {
  messagePrefix: "\x19Litecoin Signed Message:\n",
  bech32: "ltc",
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

const LitecoinWallet = () => {
  const [walletData, setWalletData] = useState({
    p2shSegwitAddress: "", // P2SH-P2WPKH (Compatible SegWit)
    nativeSegwitAddress: "", // P2WPKH (Native SegWit)
    publicKey: "",
    privateKey: "",
    wif: "",
  });
  const [loading, setLoading] = useState(false);

  const generateWallet = async () => {
    setLoading(true);

    try {
      // Initialize ECPair with secp256k1
      const ECPair = ECPairFactory(ecc);

      // Generate random bytes using react-native-get-random-values
      const randomBytes = new Uint8Array(32);
      getRandomValues(randomBytes);

      // Create key pair from random bytes with Litecoin network parameters
      const keyPair = ECPair.fromPrivateKey(Buffer.from(randomBytes), {
        network: litecoin,
      });

      // Get public and private keys
      const publicKey = keyPair.publicKey.toString("hex");
      const privateKey = keyPair.privateKey.toString("hex");
      const wif = keyPair.toWIF();

      // Generate P2SH-P2WPKH address (Compatible SegWit)
      const p2shSegwit = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: litecoin,
        }),
        network: litecoin,
      });

      // Generate P2WPKH address (Native SegWit)
      const nativeSegwit = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: litecoin,
      });

      // Update state with new wallet data
      setWalletData({
        p2shSegwitAddress: p2shSegwit.address, // Starts with 'M' or 'N'
        nativeSegwitAddress: nativeSegwit.address, // Starts with 'ltc1'
        publicKey,
        privateKey,
        wif,
      });

      Alert.alert(
        "Litecoin Wallet Generated Successfully",
        "Your wallet has two addresses:\n\n" +
          "• Compatible SegWit (starts with 'M' or 'N')\n" +
          "• Native SegWit (starts with 'ltc1')\n\n" +
          "Native SegWit offers the lowest fees, but Compatible SegWit has better compatibility with older wallets.",
        [
          {
            text: "I Understand",
            onPress: () => showSecurityAlert(),
          },
        ]
      );
    } catch (error) {
      console.error("Error generating wallet:", error);
      Alert.alert(
        "Error",
        "Failed to generate Litecoin wallet. Please try again."
      );
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Litecoin SegWit Wallet Generator</Text>

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
              placeholder="Will start with 'M' or 'N'"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Native SegWit Address (P2WPKH):</Text>
            <TextInput
              style={styles.input}
              value={walletData.nativeSegwitAddress}
              editable={false}
              selectTextOnFocus
              placeholder="Will start with 'ltc1'"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Public Key:</Text>
            <TextInput
              style={styles.input}
              value={walletData.publicKey}
              editable={false}
              selectTextOnFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Private Key:</Text>
            <TextInput
              style={styles.input}
              value={walletData.privateKey}
              editable={false}
              secureTextEntry
              selectTextOnFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>WIF (Wallet Import Format):</Text>
            <TextInput
              style={styles.input}
              value={walletData.wif}
              editable={false}
              secureTextEntry
              selectTextOnFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#345D9D" }]}
            onPress={generateWallet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Generate New Wallet</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            ℹ️ Native SegWit (ltc1) addresses offer the lowest transaction fees
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoText: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
    fontSize: 14,
  },
});

export default LitecoinWallet;
