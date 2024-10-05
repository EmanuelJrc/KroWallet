import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

const SendScreen = () => {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState(null);

  const handleSend = async () => {
    const privateKey = ""; // Use the private key from the wallet
    const hash = await sendNanoTransaction(privateKey, destination, amount);
    setTransactionHash(hash);
  };

  return (
    <View>
      <Text>Send Nano</Text>
      <TextInput
        placeholder="Recipient Address"
        value={destination}
        onChangeText={setDestination}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Send" onPress={handleSend} />
      {transactionHash && (
        <Text>Transaction Sent! Hash: {transactionHash}</Text>
      )}
    </View>
  );
};

export default SendScreen;
