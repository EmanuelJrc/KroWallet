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

// Define Bitcoin Cash network parameters
const bch = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00, // Legacy addresses start with '1'
  scriptHash: 0x05, // Legacy P2SH addresses start with '3'
  wif: 0x80, // Private key WIF format
};

const BitcoinCashWallet = () => {
  const [walletData, setWalletData] = useState({
    legacyAddress: "", // Legacy format (1...)
    p2shAddress: "", // P2SH format (3...)
    publicKey: "",
    privateKey: "",
    wif: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showWIF, setShowWIF] = useState(false);

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
    const walletExport = `BITCOIN CASH WALLET BACKUP
DO NOT SHARE THESE DETAILS WITH ANYONE!
Generated: ${new Date().toISOString()}

Legacy Address: ${walletData.legacyAddress}
P2SH Address: ${walletData.p2shAddress}
Public Key: ${walletData.publicKey}
Private Key: ${walletData.privateKey}
WIF: ${walletData.wif}

KEEP THIS INFORMATION SECURE!`;

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

      const keyPair = ECPair.fromPrivateKey(Buffer.from(randomBytes), {
        network: bch,
      });

      const publicKey = keyPair.publicKey.toString("hex");
      const privateKey = keyPair.privateKey.toString("hex");
      const wif = keyPair.toWIF();

      // Generate legacy address (1...)
      const p2pkh = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: bch,
      });

      // Generate P2SH address (3...)
      const p2sh = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2pk({
          pubkey: keyPair.publicKey,
          network: bch,
        }),
        network: bch,
      });

      setWalletData({
        legacyAddress: p2pkh.address,
        p2shAddress: p2sh.address,
        publicKey,
        privateKey,
        wif,
      });

      Alert.alert(
        "Bitcoin Cash Wallet Generated Successfully",
        "Your wallet addresses have been generated.\n\n" +
          "• Legacy Address (starts with '1')\n" +
          "• P2SH Address (starts with '3')\n\n" +
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
        "Failed to generate Bitcoin Cash wallet. Please try again."
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
        <Text style={styles.title}>Bitcoin Cash Wallet Generator</Text>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Legacy Address:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithButton]}
                value={walletData.legacyAddress}
                editable={false}
                selectTextOnFocus
                placeholder="Will start with '1'"
              />
              {walletData.legacyAddress && (
                <CopyButton
                  text={walletData.legacyAddress}
                  label="Legacy Address"
                />
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>P2SH Address:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithButton]}
                value={walletData.p2shAddress}
                editable={false}
                selectTextOnFocus
                placeholder="Will start with '3'"
              />
              {walletData.p2shAddress && (
                <CopyButton
                  text={walletData.p2shAddress}
                  label="P2SH Address"
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
            style={[styles.button, { backgroundColor: "#8DC351" }]} // BCH green
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
    color: "#8DC351", // BCH green
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
    backgroundColor: "#8DC351", // BCH green
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
    backgroundColor: "#8DC351", // BCH green
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

export default BitcoinCashWallet;
