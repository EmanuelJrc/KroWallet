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
import * as Clipboard from "expo-clipboard";
import { Buffer } from "@craftzdog/react-native-buffer";
import { createHash } from "create-hash";
import * as bs58 from "bs58";

// Custom base58check encoding function for ZCash transparent addresses
const base58checkEncode = (payload, version) => {
  console.log("Using version:", version); // Ensure it’s 0x1C or 28

  // Create a buffer with a one-byte version instead of two
  const versionBuffer = Buffer.alloc(1);
  versionBuffer.writeUInt8(version); // Using 0x1C for ZCash

  const versionedPayload = Buffer.concat([versionBuffer, payload]);

  // Calculate the double SHA-256 checksum and take the first 4 bytes
  const checksum = createHash("sha256")
    .update(createHash("sha256").update(versionedPayload).digest())
    .digest()
    .slice(0, 4);

  const finalBuffer = Buffer.concat([versionedPayload, checksum]);

  return bs58.encode(finalBuffer);
};

// Define ZCash network parameters
const zec = {
  messagePrefix: "\x18ZCash Signed Message:\n",
  bech32: "",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x1cb8, // Transparent addresses start with 't1'
  wif: 0x80,
};

const ZCashWallet = () => {
  const [walletData, setWalletData] = useState({
    transparentAddress: "", // t1... address
    publicKey: "",
    privateKey: "",
    wif: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showWIF, setShowWIF] = useState(false);

  // Generate ZCash transparent address with additional logging
  const generateZCashAddress = (publicKeyBuffer) => {
    console.log("Public Key Buffer:", publicKeyBuffer.toString("hex"));
    const hash160 = bitcoin.crypto.hash160(publicKeyBuffer);
    console.log("Hash160 of Public Key:", hash160.toString("hex"));
    return base58checkEncode(hash160, 0x1cb8);
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

  const exportWalletData = async () => {
    const walletExport = `ZCASH WALLET BACKUP
DO NOT SHARE THESE DETAILS WITH ANYONE!
Generated: ${new Date().toISOString()}

Transparent Address: ${walletData.transparentAddress}
Public Key: ${walletData.publicKey}
Private Key: ${walletData.privateKey}
WIF: ${walletData.wif}

KEEP THIS INFORMATION SECURE!
Note: This wallet generates transparent addresses only. For shielded transactions, 
please use a full ZCash wallet that supports z-addresses.`;

    try {
      await Clipboard.setStringAsync(walletExport);
      Alert.alert(
        "Wallet Exported",
        "All wallet data has been copied to your clipboard. Please store it in a secure location immediately.",
        [
          {
            text: "I've Stored It Safely",
            style: "default",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to export wallet data");
      console.error("Export error:", error);
    }
  };

  const generateWallet = async () => {
    setLoading(true);

    try {
      const ECPair = ECPairFactory(ecc);
      const randomBytes = new Uint8Array(32);
      getRandomValues(randomBytes);

      console.log(
        "Random Bytes for Private Key:",
        Buffer.from(randomBytes).toString("hex")
      );

      const keyPair = ECPair.fromPrivateKey(Buffer.from(randomBytes), {
        network: bitcoin.networks.bitcoin, // Use bitcoin parameters for testing
      });

      const publicKey = keyPair.publicKey.toString("hex");
      const privateKey = keyPair.privateKey.toString("hex");
      const wif = keyPair.toWIF();

      console.log("Generated Public Key:", publicKey);
      console.log("Generated Private Key:", privateKey);
      console.log("Generated WIF:", wif);

      // Generate t1 address (transparent)
      const transparentAddress = generateZCashAddress(keyPair.publicKey);

      console.log("Generated Transparent Address:", transparentAddress);

      setWalletData({
        transparentAddress,
        publicKey,
        privateKey,
        wif,
      });

      Alert.alert(
        "ZCash Wallet Generated Successfully",
        "Your transparent addresses have been generated.\n\n" +
          "• Transparent Address (starts with 't1')\n" +
          "Please backup your private keys immediately.",
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
        "Failed to generate ZCash wallet. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const showSecurityAlert = () => {
    Alert.alert(
      "⚠️ Security Warning",
      "Your wallet credentials have been generated. Please:\n\n" +
        "1. Copy and securely store your Private Key and WIF\n" +
        "2. Use the Export function to backup all wallet data\n" +
        "3. Never share these details with anyone\n" +
        "4. Keep multiple secure backups\n\n" +
        "Note: This generates transparent addresses only. For private transactions,\n" +
        "use a full ZCash wallet with shielded address support.\n\n" +
        "Would you like to export your wallet data now?",
      [
        {
          text: "Export Wallet Data",
          onPress: exportWalletData,
          style: "default",
        },
        {
          text: "I'll do it later",
          style: "cancel",
        },
      ]
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ZCash Wallet Generator</Text>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transparent Address:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithButton]}
                value={walletData.transparentAddress}
                editable={false}
                selectTextOnFocus
                placeholder="Will start with 't1'"
              />
              {walletData.transparentAddress && (
                <CopyButton
                  text={walletData.transparentAddress}
                  label="Transparent Address"
                />
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Public Key:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithButton]}
                value={walletData.publicKey}
                editable={false}
                selectTextOnFocus
              />
              {walletData.publicKey && (
                <CopyButton text={walletData.publicKey} label="Public Key" />
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Private Key:</Text>
              <TouchableOpacity
                onPress={() => setShowPrivateKey(!showPrivateKey)}
              >
                <Text style={styles.toggleButton}>
                  {showPrivateKey ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithButton]}
                value={walletData.privateKey}
                editable={false}
                secureTextEntry={!showPrivateKey}
                selectTextOnFocus
              />
              {walletData.privateKey && (
                <CopyButton text={walletData.privateKey} label="Private Key" />
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>WIF:</Text>
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
              {walletData.wif && (
                <CopyButton text={walletData.wif} label="WIF" />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#F4B728" }]} // ZCash yellow
            onPress={generateWallet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Generate New Wallet</Text>
            )}
          </TouchableOpacity>

          {walletData.wif && (
            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={exportWalletData}
            >
              <Text style={styles.buttonText}>Export Wallet Data</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.securityText}>
            🔒 Make sure to save your Private Key and WIF in a secure location
            {"\n"}
            Note: This generates transparent addresses only
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
    color: "#F4B728", // ZCash yellow
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
    backgroundColor: "#F4B728", // ZCash yellow
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
    backgroundColor: "#F4B728", // ZCash yellow
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
});

export default ZCashWallet;
