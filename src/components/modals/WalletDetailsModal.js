import React from "react";
import {
  Modal,
  View,
  Text,
  Button,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

const WalletDetailsModal = ({
  visible,
  onClose,
  mnemonic,
  privateKey,
  onCopy,
  onDelete,
  fadeAnim,
  translateYAnim,
}) => {
  const copyToClipboard = (text, type) => {
    onCopy(text, type);
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <Text style={styles.modalTitle}>Mnemonic</Text>
          <Text selectable style={styles.secretKeyText}>
            {mnemonic}
          </Text>
          <Button
            title="Copy Mnemonic"
            onPress={() => copyToClipboard(mnemonic, "Mnemonic")}
          />

          <Text style={styles.modalTitle}>Private Key</Text>
          <Text selectable style={styles.secretKeyText}>
            {privateKey}
          </Text>
          <Button
            title="Copy Private Key"
            onPress={() => copyToClipboard(privateKey, "Private Key")}
          />

          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Delete Wallet</Text>
          </TouchableOpacity>

          <Button title="Close" onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  secretKeyText: {
    fontSize: 14,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WalletDetailsModal;
