import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import { Button } from "react-native-paper";

const WalletDetailsModal = ({
  visible,
  onClose,
  mnemonic,
  privateKey,
  onCopy,
  onDelete,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        translateYAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateYAnim, {
      toValue: visible ? 0 : 50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim, translateYAnim]);

  const copyToClipboard = (text, type) => {
    onCopy(text, type);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirmation = (confirm) => {
    setShowDeleteConfirmation(false);
    if (confirm) {
      onDelete();
    }
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
          {...panResponder.panHandlers}
        >
          <Text style={styles.modalTitle}>Mnemonic</Text>
          <Text selectable style={styles.secretKeyText}>
            {mnemonic}
          </Text>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => copyToClipboard(mnemonic, "Mnemonic")}
          >
            Copy Mnemonic
          </Button>

          <Text style={styles.modalTitle}>Private Key</Text>
          <Text selectable style={styles.secretKeyText}>
            {privateKey}
          </Text>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => copyToClipboard(privateKey, "Private Key")}
          >
            Copy Private Key
          </Button>

          <Button
            mode="contained"
            style={styles.deleteButton}
            onPress={confirmDelete}
          >
            Delete Wallet
          </Button>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={onClose}
              style={([styles.closeButton], styles.button)}
            >
              Close
            </Button>
          </View>
        </Animated.View>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <Modal
            transparent
            animationType="fade"
            visible={showDeleteConfirmation}
          >
            <View style={styles.overlay}>
              <View style={styles.confirmationBox}>
                <Text style={styles.confirmationText}>
                  Are you sure you want to delete the wallet?
                </Text>
                <View style={styles.confirmationButtons}>
                  <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => handleDeleteConfirmation(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    mode="contained"
                    style={styles.noButton}
                    onPress={() => handleDeleteConfirmation(false)}
                  >
                    No
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        )}
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#333",
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
    color: "white",
  },
  secretKeyText: {
    fontSize: 14,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    color: "white",
  },
  buttonContainer: {
    marginTop: 60,
  },
  closeButton: {
    borderRadius: 25,
  },
  deleteButtonText: {
    Top: 10,
    color: "white",
    fontWeight: "bold",
  },
  confirmationBox: {
    backgroundColor: "#444",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  confirmationText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#296fc5",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    marginTop: 60,
  },
  noButton: {
    backgroundColor: "#ff4444",
  },
});

export default WalletDetailsModal;
