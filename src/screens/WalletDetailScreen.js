import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";

export default function WalletDetailScreen({ route }) {
  const { mnemonic, privateKey } = route.params;

  const copyMnemonicToClipboard = async () => {
    await Clipboard.setStringAsync(mnemonic);
    alert("Mnemonic copied to clipboard");
  };
  const copyKeyToClipboard = async () => {
    await Clipboard.setStringAsync(privateKey);
    alert("Private Key copied to clipboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mnemonic:</Text>
      <Text style={styles.text}>{mnemonic}</Text>
      {/* Copy button */}
      <Pressable style={styles.button} onPress={copyMnemonicToClipboard}>
        <Text style={styles.textStyle}>Copy Address</Text>
      </Pressable>

      <Text style={styles.label}>Private Key:</Text>
      <Text style={styles.text}>{privateKey}</Text>
      {/* Copy button */}
      <Pressable style={styles.button} onPress={copyKeyToClipboard}>
        <Text style={styles.textStyle}>Copy Address</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#333",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    marginTop: 10,
    marginBottom: 20,
  },
});
