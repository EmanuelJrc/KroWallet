import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
  Linking,
  Alert,
  Modal,
  Animated,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemeContext } from "../../utils/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const Xrp = () => {
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [balance, setBalance] = useState(null);

  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the header background color interpolation
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 100], // Adjust this range based on your header height
    outputRange: ["transparent", isDarkMode ? "#333" : "#fff"], // Change the colors as needed
    extrapolate: "clamp", // Prevents values from exceeding the defined range
  });

  // Set up header with the info button
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../assets/xrp.png")} // Update the path to your image
            style={{ width: 24, height: 24, marginRight: 8 }} // Adjust size and margin as needed
          />
          <Text
            style={{
              color: isDarkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            XRP
          </Text>
        </View>
      ),
      headerShown: true,
      headerTransparent: true,
      headerStyle: {
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
      },
      headerRight: () => (
        <TouchableOpacity onPress={openModal} style={{ marginRight: 15 }}>
          <Icon
            name="information-circle-outline"
            size={28}
            color={isDarkMode ? "white" : "black"}
            paddingRight={15}
          />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Icon
            name="arrow-back"
            size={28}
            color={isDarkMode ? "white" : "black"}
            paddingLeft={15}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fade and slide animations for opening the modal
  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fade and slide animations for closing the modal
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  // Function to handle the pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    try {
      // Re-fetch balance and transactions
      await checkBalance();
      await fetchTransactions();
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  };

  const openExplore = async () => {
    try {
      Linking.openURL("https://testnet.lumenscan.io/account/" + publicKey);
    } catch (error) {
      console.log("https://testnet.lumenscan.io/account/" + publicKey);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 110, // Adjust based on your header height
          backgroundColor: headerBackgroundColor,
          zIndex: 1, // Ensure it sits above other components
        }}
      />
      <LinearGradient
        colors={
          isDarkMode
            ? ["#296fc5", "#3d3d3d", "#3d3d3d", "#333333"]
            : ["#296fc5", "#5d97dd", "#ffffff", "#f0f0f0"]
        }
        style={StyleSheet.absoluteFill}
      />
      <Animated.ScrollView
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // Use native driver for better performance
        )}
        scrollEventThrottle={16} // Update every 16ms
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>
          <ScrollView style={{ padding: 15, minHeight: 140 }}>
            <View style={styles.container}>
              <View style={styles.balanceInfo}>
                <Text selectable style={styles.balanceText}>
                  {/* {balance} */} 0.000 XRP
                </Text>
                <Text style={styles.fiatBalanceText}>
                  {/* ${fiatBalance ? fiatBalance : "0.00"} */}$0.00
                </Text>
              </View>
              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, isDarkMode && styles.darkButton]}
                  onPress={() => setSendModalVisible(true)}
                >
                  <Icon
                    name="send"
                    size={24}
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Send
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, isDarkMode && styles.darkButton]}
                  onPress={() => setReceiveModalVisible(true)}
                >
                  <Icon
                    name="download"
                    size={24}
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Receive
                  </Text>
                  {/* Modal to display QR code and address */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, isDarkMode && styles.darkButton]}
                >
                  <Icon
                    name="cash-outline"
                    size={24}
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    Buy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, isDarkMode && styles.darkButton]}
                  onPress={openExplore}
                >
                  <Icon
                    name="exit"
                    size={24}
                    color={isDarkMode ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

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
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceInfo: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "black",
    fontWeight: "regular",
    fontSize: 16,
    paddingTop: 5,
  },
  darkText: {
    color: "white",
  },
  transactionHistory: {
    marginTop: 20,
    width: "100%",
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  transactionItem: {
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountReceived: {
    color: "green",
  },
  amountSent: {
    color: "red",
  },
  transactionAddress: {
    fontSize: 14,
    color: "#6a6a6a",
    marginTop: 5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: "#d9d9d9",
    width: 70, // Set fixed width
    height: 70, // Set fixed height
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  darkButton: {
    color: "#fff",
    backgroundColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0078FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  walletInfo: {
    marginTop: 30,
    width: "100%",
  },
  balanceText: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  fiatBalanceText: {
    color: "#adadad",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    width: "80%",
    height: 100,
  },
});

export default Xrp;
