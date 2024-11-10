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
import { Copy } from "lucide-react"; // Import the copy icon

// Define Dogecoin network parameters
const dogecoin = {
  messagePrefix: "\x19Dogecoin Signed Message:\n",
  bech32: "doge", // Note: Dogecoin doesn't widely support bech32 yet
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};

const DogecoinWallet = () => {
  const [walletData, setWalletData] = useState({
    legacyAddress: "", // Standard P2PKH address
    p2shAddress: "", // P2SH address
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

      // Create key pair from random bytes with Dogecoin network parameters
      const keyPair = ECPair.fromPrivateKey(Buffer.from(randomBytes), {
        network: dogecoin,
      });

      // Get public and private keys
      const publicKey = keyPair.publicKey.toString("hex");
      const privateKey = keyPair.privateKey.toString("hex");
      const wif = keyPair.toWIF();

      // Generate Legacy P2PKH address
      const p2pkh = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: dogecoin,
      });

      // Generate P2SH address
      const p2sh = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2pk({
          pubkey: keyPair.publicKey,
          network: dogecoin,
        }),
        network: dogecoin,
      });

      // Update state with new wallet data
      setWalletData({
        legacyAddress: p2pkh.address, // Starts with 'D'
        p2shAddress: p2sh.address, // Starts with 'A'
        publicKey,
        privateKey,
        wif,
      });

      Alert.alert(
        "Dogecoin Wallet Generated Successfully",
        "Your wallet has two addresses:\n\n" +
          "• Legacy Address (starts with 'D')\n" +
          "• Script Address (starts with 'A')\n\n" +
          "Legacy addresses are most widely supported for Dogecoin.",
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
        "Failed to generate Dogecoin wallet. Please try again."
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
        <Text style={styles.title}>Dogecoin Wallet Generator</Text>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Legacy Address (P2PKH):</Text>
            <TextInput
              style={styles.input}
              value={walletData.legacyAddress}
              editable={false}
              selectTextOnFocus
              placeholder="Will start with 'D'"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Script Address (P2SH):</Text>
            <TextInput
              style={styles.input}
              value={walletData.p2shAddress}
              editable={false}
              selectTextOnFocus
              placeholder="Will start with 'A'"
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
              selectTextOnFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>WIF (Wallet Import Format):</Text>
            <TextInput
              style={styles.input}
              value={walletData.wif}
              editable={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#BA9F33" }]}
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
            ℹ️ Legacy addresses (D) are most widely supported for Dogecoin
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

export default DogecoinWallet;
