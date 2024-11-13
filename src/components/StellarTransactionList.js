import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../utils/ThemeContext";

const TransactionHistory = ({ transactions, publicKey, isDarkMode }) => {
  return (
    transactions.length > 0 && (
      <View style={styles.transactionHistory}>
        <Text style={[styles.transactionTitle, isDarkMode && styles.darkText]}>
          Transaction History
        </Text>
        {transactions.map((tx) => {
          const isReceived = tx.to === publicKey;
          return (
            <View
              key={tx.id}
              style={[
                styles.transactionItem,
                isDarkMode && styles.darkButton,
                isReceived
                  ? styles.receivedTransaction
                  : styles.sentTransaction,
              ]}
            >
              <Text style={styles.transactionDate}>
                {new Date(tx.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.transactionContent}>
                <Text
                  style={[
                    styles.transactionType,
                    isDarkMode && styles.darkText,
                  ]}
                >
                  {isReceived ? "Received" : "Sent"}
                </Text>
                <Text
                  style={[
                    styles.transactionAmount,
                    isReceived ? styles.amountReceived : styles.amountSent,
                  ]}
                >
                  {isReceived ? `+${tx.amount}` : `-${tx.amount}`} {tx.asset}
                </Text>
              </View>
              <Text style={styles.transactionAddress}>
                {isReceived ? `From: ${tx.from}` : `To: ${tx.to}`}
              </Text>
            </View>
          );
        })}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  darkButton: {
    color: "#fff",
    backgroundColor: "#333",
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
});

export default TransactionHistory;
