import React, { useState } from "react";
import { SafeAreaView, Text, Button, TextInput } from "react-native";
import { createWallet, getBalance, sendTransaction } from "../solanaFunctions";

export default function SendScreen() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  const handleCreateWallet = async () => {
    const newWallet = await createWallet();
    setWallet(newWallet);
  };

  const handleCheckBalance = async () => {
    if (wallet) {
      const walletBalance = await getBalance(wallet.publicKey);
      setBalance(walletBalance);
    }
  };

  const handleSendTransaction = async () => {
    if (wallet) {
      await sendTransaction(wallet.keypair, recipient, amount * 1e9); // Convert to lamports
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button title="Create Wallet" onPress={handleCreateWallet} />
      {wallet && <Text>Wallet Address: {wallet.publicKey}</Text>}

      <Button title="Check Balance" onPress={handleCheckBalance} />
      {balance !== null && <Text>Balance: {balance} lamports</Text>}

      <TextInput
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <TextInput
        placeholder="Amount (in SOL)"
        value={amount}
        onChangeText={(text) => setAmount(Number(text))}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="Send Transaction" onPress={handleSendTransaction} />
    </SafeAreaView>
  );
}
