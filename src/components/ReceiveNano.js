import React from "react";
import { View, Text, Pressable, Modal, Button } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { styles } from "../styles/nanoStyles";

export default function ReceiveNano({
  visible,
  onClose,
  address,
  onReceive,
  receivingStatus,
}) {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    alert("Address copied to clipboard");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Receive Nano</Text>
          {address ? (
            <QRCode value={address} size={200} />
          ) : (
            <Text>No address available</Text>
          )}
          <Text style={styles.addressText}>{address}</Text>
          <Pressable style={styles.button} onPress={copyToClipboard}>
            <Text style={styles.textStyle}>Copy Address</Text>
          </Pressable>
          <Button title="Receive Pending Transactions" onPress={onReceive} />
          {receivingStatus && (
            <Text style={styles.statusText}>{receivingStatus}</Text>
          )}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
