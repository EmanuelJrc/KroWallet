import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemeContext } from "../../utils/ThemeContext";
import { Button } from "react-native-paper";
import QRCodeScannerScreen from "../../screens/QRCodeScannerScreen";

export default function SendModal({
  name,
  ticker,
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
  const { height } = Dimensions.get("window");
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);

  const handleQRCodeScan = () => {
    setVisible(false);
    navigation.navigate("QRCodeScanner", {
      previousScreen: "SendNano",
      onScanComplete: (scannedAddress) => {
        setRecipientAddress(scannedAddress);
        setVisible(true);
      },
    });
  };

  const [modalHeight, setModalHeight] = useState(height * 0.19);
  const [isDragging, setIsDragging] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(height)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const draggedDistance = gestureState.dy;
        if (draggedDistance > 100) {
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(slideAnim, {
            toValue: modalHeight,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(modalHeight + gestureState.dy);
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: modalHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, modalHeight]);

  const handleHeaderPress = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  const handleHeaderLayout = (event) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.receiveHeader,
            isDragging && { backgroundColor: "#444" },
          ]}
          activeOpacity={1}
          onLayout={handleHeaderLayout}
        >
          <TouchableOpacity
            onPress={handleHeaderPress}
            style={styles.receiveIconButton}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={isDarkMode ? "#FFF" : "#000"}
            />
          </TouchableOpacity>

          <Text style={styles.receiveHeaderText}>Send {name}</Text>

          <TouchableOpacity
            onPress={handleSendTransaction}
            style={styles.iconButton}
          >
            <Text style={styles.sendHeaderText}>Send</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.addressInput}
            placeholder="Recipient Address"
            placeholderTextColor="#C0C0C0"
            onChangeText={setRecipientAddress}
            value={recipientAddress}
          />
          <TouchableOpacity
            onPress={handleQRCodeScan}
            style={styles.qrIconButton}
          >
            <Icon
              name="qr-code-outline"
              size={24}
              color={isDarkMode ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.sendModalView}>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={[styles.inputField, styles.amountInput]}
              placeholder="0"
              placeholderTextColor="#C0C0C0"
              keyboardType="numeric"
              onChangeText={setAmountToSend}
              value={amountToSend.replace(",", ".")}
            />
            <Text style={styles.tickerText}>{ticker}</Text>
          </View>
        </View>
        <View style={styles.sendButtonView}>
          <Button
            mode="contained"
            style={styles.shareButton}
            onPress={() => {
              handleSendTransaction();
            }}
            labelStyle={styles.shareButtonLabel}
          >
            Send
          </Button>
        </View>
      </Animated.View>
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
    backgroundColor: "#1a1a1a",
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tickerText: {
    fontSize: 42,
    marginLeft: 8,
    color: "#666",
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 120,
  },
  sendButtonView: {
    alignItems: "center",
    justifyContent: "center",
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
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addressInput: {
    backgroundColor: "#333",
    color: "#fff",
    width: "80%",
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  qrIconButton: {
    padding: 8,
  },
  inputField: {
    fontSize: 48,
    color: "#FFF",
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
    backgroundColor: "#1a1a1a", // Dimmed background
  },
  receivingStatusText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
  receiveModalContainer: {
    flex: 1,
    justifyContent: "top",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  receiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#333333", // Customize based on your theme
    minWidth: "100%",
  },
  receiveModalView: {
    margin: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
  },
  receiveIconButton: {
    padding: 8,
  },
  receiveHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Customize based on your theme
  },
  sendHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Customize based on your theme
    marginLeft: -15,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  shareButton: {
    maxWidth: "90%",
    minWidth: "90%",
    backgroundColor: "#296fc5",
    height: "25%",
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "bold",
    borderRadius: 25,
  },
  shareButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
