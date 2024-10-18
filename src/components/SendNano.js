import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { styles } from "../styles/nanoStyles";

export default function SendNano({
  visible,
  onClose,
  handleSendTransaction,
  recipientAddress,
  setRecipientAddress,
  amountToSend,
  setAmountToSend,
  transactionStatus,
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sendModalView}>
          <Text style={styles.modalTitle}>Send Nano:</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Recipient Address"
            placeholderTextColor="#C0C0C0"
            onChangeText={setRecipientAddress}
            value={recipientAddress}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Amount"
            placeholderTextColor="#C0C0C0"
            keyboardType="numeric"
            onChangeText={setAmountToSend}
            value={amountToSend.replace(",", ".")}
          />
          {transactionStatus ? <Text>{transactionStatus}</Text> : null}
          <Pressable style={styles.button} onPress={handleSendTransaction}>
            <Text style={styles.buttonText}>Send Nano</Text>
          </Pressable>
          <Pressable
            style={[styles.sendButton, styles.sendButtonClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
