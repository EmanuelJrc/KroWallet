import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import bip39 from "bip39";
import bitcoin from "bitcoinjs-lib";

const BitcoinScreeen = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState("");

  const generateWallet = () => {
    // Generate a new mnemonic (seed phrase)
    const newMnemonic = bip39.generateMnemonic();
    setMnemonic(newMnemonic);

    // Derive the master key from the mnemonic
    const seed = bip39.mnemonicToSeedSync(newMnemonic);
    const masterKey = bitcoin.bip32.fromSeed(seed);

    // Derive the Bitcoin address
    const { address } = bitcoin.payments.p2pkh({
      pubkey: masterKey.derive(0).derive(0).publicKey,
    });
    setAddress(address);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Bitcoin Wallet</Text>
      <View style={styles.content}>
        <Text style={styles.label}>Mnemonic (seed phrase):</Text>
        <TextInput style={styles.input} value={mnemonic} editable={false} />
        <Text style={styles.label}>Bitcoin Address:</Text>
        <TextInput style={styles.input} value={address} editable={false} />
        <TouchableOpacity style={styles.button} onPress={generateWallet}>
          <Text style={styles.buttonText}>Generate Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f1f1f",
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2f2f2f",
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007aff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BitcoinScreeen;
