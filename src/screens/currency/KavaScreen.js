// shim.js
import { Buffer } from "buffer";
import "react-native-get-random-values";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
getRandomValues = expoCryptoGetRandomValues;

// Make sure Buffer is defined globally
global.Buffer = Buffer;

// BitcoinWallet.js
import "../../../shim";

import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as SecureStore from "expo-secure-store";
import ECPairFactory from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import { bech32 } from "bech32";
import { sha256 } from "js-sha256";

const KAVA_PREFIX = "kava";
const BIP44_PATH = "m/44'/459'/0'/0/0"; // BIP44 path for Cosmos-based chains like Kava

// Initialize bip32 and ECPair with secp256k1
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const KavaScreen = () => {
  const [wallet, setWallet] = useState(null);

  const generateWallet = async () => {
    try {
      // Step 1: Generate a mnemonic
      const mnemonic = bip39.generateMnemonic();
      console.log("Mnemonic:", mnemonic);

      // Step 2: Save mnemonic to secure storage
      await SecureStore.setItemAsync("kava_mnemonic", mnemonic);

      // Step 3: Derive the seed from the mnemonic
      const seed = await bip39.mnemonicToSeed(mnemonic);
      console.log("Seed:", seed);

      // Step 4: Generate a BIP32 root key from the seed
      const root = bip32.fromSeed(seed);
      const child = root.derivePath(BIP44_PATH);

      // Step 5: Get the private and public keys
      const privateKeyHex = child.privateKey.toString("hex");
      const privateKeyBase64 = Buffer.from(child.privateKey).toString("base64");
      const privateKeyBuffer = child.privateKey; // Direct Buffer format
      const publicKey = child.publicKey;

      // Step 6: Generate the Kava address using Bech32 encoding
      const publicKeyHash = sha256(publicKey);
      const words = bech32.toWords(
        Buffer.from(publicKeyHash, "hex").slice(0, 20)
      );
      const address = bech32.encode(KAVA_PREFIX, words);

      // Set wallet details in state
      setWallet({
        mnemonic,
        address,
        privateKeyHex,
        privateKeyBase64,
        privateKeyBuffer,
      });

      // Alert success
      Alert.alert("Wallet Created", `Public Address: ${address}`);
    } catch (error) {
      console.error("Error generating wallet:", error);
      Alert.alert("Error", "Failed to generate wallet.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kava Wallet Generator</Text>

      <Button title="Generate Wallet" onPress={generateWallet} />

      {wallet && (
        <View style={styles.walletInfo}>
          <Text style={styles.info}>Public Address: {wallet.address}</Text>
          <Text style={styles.info} selectable>
            Mnemonic: {wallet.mnemonic}
          </Text>
          <Text style={styles.info} selectable>
            Private Key (Hex): {wallet.privateKeyHex}
          </Text>
          <Text style={styles.info} selectable>
            Private Key (Base64): {wallet.privateKeyBase64}
          </Text>
          <Text style={styles.info} selectable>
            Private Key (Buffer): {wallet.privateKeyBuffer.toString("hex")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  walletInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default KavaScreen;
