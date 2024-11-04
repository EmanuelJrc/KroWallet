import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { styles } from "../../styles/stellarStyles";
import { ThemeContext } from "../../utils/ThemeContext";

const WalletTransactionHistory = ({ address }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (address) {
      fetchTransactionHistory(address);
    }
  }, [address]);

  const fetchTransactionHistory = async (address) => {
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_BSCSCAN_API_KEY; // Replace with your Etherscan API key
      const response = await axios.get(
        `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
      );
      console.log("API Response:", response.data);
      if (response.data.status === "1") {
        setTransactions(response.data.result);
      } else {
        console.error("No transactions found");
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View
      style={{
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#d9d9d9",
        borderRadius: 5,
      }}
    >
      <Text>
        <Text style={{ fontWeight: "bold" }}>Hash:</Text> {item.hash}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Type:</Text>{" "}
        <Text
          style={{
            color: item.from === address.toLowerCase() ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {item.from === address.toLowerCase() ? "Send" : "Receive"}
        </Text>
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>From:</Text> {item.from}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>To:</Text> {item.to}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Value:</Text>{" "}
        {parseFloat(ethers.formatEther(item.value)).toFixed(5)} BNB
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Timestamp:</Text>{" "}
        {new Date(item.timeStamp * 1000).toLocaleString()}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Status:</Text>{" "}
        {item.isError === "0" ? "Success" : "Failed"}
      </Text>
    </View>
  );

  return (
    <View style={styles.transactionHistory}>
      <Text style={[styles.transactionTitle, isDarkMode && styles.darkText]}>
        Transaction History
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.hash}
        />
      ) : (
        <Text>No transactions found.</Text>
      )}
    </View>
  );
};

export default WalletTransactionHistory;
