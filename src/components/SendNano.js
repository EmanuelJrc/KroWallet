import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { styles } from "../styles/nanoStyles";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function SendNano({
  name,
  visible,
  onClose,
  handleSendTransaction,
  recipientAddress,
  setRecipientAddress,
  amountToSend,
  setAmountToSend,
  transactionStatus,
}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScannerVisible, setScannerVisible] = useState(false);

  // Request camera permission for QR code scanning
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Handle QR code scanned result
  const handleBarCodeScanned = ({ data }) => {
    setRecipientAddress(data); // Set recipient address with QR code data
    setScannerVisible(false); // Close scanner modal
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sendModalView}>
          <Text style={styles.modalTitle}>Send {name}</Text>
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

          {/* QR Code Scan Button */}
          <Pressable
            style={styles.button}
            onPress={() => setScannerVisible(true)}
          >
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={handleSendTransaction}>
            <Text style={styles.buttonText}>Send {name}</Text>
          </Pressable>
          <Pressable
            style={[styles.sendButton, styles.sendButtonClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {/* QR Code Scanner Modal */}
      {isScannerVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isScannerVisible}
        >
          <View style={styles.modalContainer}>
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.barcodeScanner}
            />
            <Pressable
              style={[styles.button, styles.sendButtonClose]}
              onPress={() => setScannerVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </Modal>
  );
}
