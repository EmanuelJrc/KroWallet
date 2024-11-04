import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
// import { styles } from "../styles/nanoStyles";
import { useNavigation } from "@react-navigation/native";
import QRCodeScannerScreen from "../screens/QRCodeScannerScreen";

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
  setVisible,
}) {
  const navigation = useNavigation();

  const handleQRCodeScan = () => {
    setVisible(false); // Hide the modal
    navigation.navigate("QRCodeScanner", {
      previousScreen: "SendNano",
      onScanComplete: (scannedAddress) => {
        setRecipientAddress(scannedAddress);
        setVisible(true); // Show the modal again after scan
      },
    });
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
          <Pressable style={styles.button} onPress={handleQRCodeScan}>
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
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  secretKeyText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    color: "white",
  },
  header: {
    paddingTop: 60,
  },
  container: {
    flexGrow: 2,
    justifyContent: "flex-end",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  balanceContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f1f1f1",
  },
  barcodeScanner: {
    width: "100%",
    height: "80%",
  },
  detailIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  darkText: {
    color: "#ffffff",
    marginBottom: 10,
  },
  modalView: {
    marginTop: "30%",
    margin: 20,
    backgroundColor: "#333333",
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
  },
  sendModalView: {
    width: "90%",
    marginTop: "30%",
    backgroundColor: "#333333",
    borderRadius: 20,
    padding: 20,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white", // Softer black
  },
  sendButton: {
    backgroundColor: "#28A745", // Green for success action
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "#1c1c1c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 8,
  },
  scanner: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: "100%",
  },
  middleRow: {
    flexDirection: "row",
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanText: {
    color: "#fff",
    fontSize: 14,
    position: "absolute",
    bottom: -30,
    textAlign: "center",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: "100%",
  },
  rescanButton: {
    position: "absolute",
    bottom: 50,
    padding: 12,
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
  },
  rescanText: {
    color: "#fff",
    fontSize: 16,
  },

  sendButtonClose: {
    backgroundColor: "#dc3545", // Red for closing action
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  inputField: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: "#000000",
    placeholderTextColor: "#000000",
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
    color: "#ffffff",
  },
  headerText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  addressText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
  },
  balanceText: {
    color: "#000",
    fontSize: 42,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  recent: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    width: "100%",
  },
  transactionHistory: {
    marginTop: 20,
    width: "100%",
  },
  fiatBalanceText: {
    color: "#adadad",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  transactionContainer: {
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  transactionHash: {
    fontSize: 14,
    color: "#666",
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  noTransactionsText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  receivingStatusText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
});
