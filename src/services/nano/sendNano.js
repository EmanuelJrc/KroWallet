// SendNano.js
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";

export default function SendNano({
  isVisible,
  onClose,
  handleSendTransaction,
}) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const handleSend = async () => {
    try {
      await handleSendTransaction(recipientAddress, amountToSend);
      setTransactionStatus("Transaction sent successfully!");
      onClose(); // Close modal on success
    } catch (error) {
      setTransactionStatus(`Error: ${error.message}`);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Send Nano</Text>

        {/* Input for recipient address */}
        <TextInput
          style={styles.input}
          placeholder="Recipient Address"
          onChangeText={setRecipientAddress}
          value={recipientAddress}
        />

        {/* Input for amount to send */}
        <TextInput
          style={styles.input}
          placeholder="Amount to Send"
          keyboardType="numeric"
          onChangeText={setAmountToSend}
          value={amountToSend}
        />

        {/* Send transaction button */}
        <Pressable style={styles.button} onPress={handleSend}>
          <Text style={styles.textStyle}>Send Transaction</Text>
        </Pressable>

        {/* Display transaction status */}
        {transactionStatus ? (
          <Text style={styles.transactionStatus}>{transactionStatus}</Text>
        ) : null}

        {/* Close the modal */}
        <Pressable
          style={[styles.button, styles.buttonClose]}
          onPress={onClose}
        >
          <Text style={styles.textStyle}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#f44336",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 5,
    width: "100%",
  },
  transactionStatus: {
    marginTop: 10,
    fontSize: 14,
    color: "green",
    textAlign: "center",
  },
});
