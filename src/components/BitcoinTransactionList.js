import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BlockchainAPI } from "./BlockchainAPI";

const BitcoinTransactionList = ({ walletAddress }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionData = await BlockchainAPI.getTransactions(
          walletAddress
        );
        setTransactions(transactionData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [walletAddress]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F7931A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.txid}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionHash}>
              Transaction Hash: {item.txid}
            </Text>
            <Text style={styles.transactionAmount}>
              {item.amount > 0
                ? `Received: ${item.amount} BTC`
                : `Sent: ${Math.abs(item.amount)} BTC`}
            </Text>
            <Text style={styles.transactionDate}>
              Date: {new Date(item.time * 1000).toLocaleString()}
            </Text>
            <Text style={styles.transactionConfirmations}>
              Confirmations: {item.confirmations}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionItem: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 8,
    width: "100%",
  },
  transactionHash: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 16,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  transactionConfirmations: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default BitcoinTransactionList;
