import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "../styles/nanoStyles";

export default function TransactionList({ transactions }) {
  return (
    <>
      <Text style={styles.recent}>Recent Transactions:</Text>
      {transactions.length === 0 ? (
        <Text>No transactions found</Text>
      ) : (
        transactions.map((tx, index) => (
          <View key={index} style={styles.transactionContainer}>
            <View style={styles.transactionHeader}>
              {tx.type === "send" ? (
                <Icon name="arrow-up-circle-outline" size={24} color="red" />
              ) : (
                <Icon
                  name="arrow-down-circle-outline"
                  size={24}
                  color="green"
                />
              )}
              <Text style={styles.transactionType}>
                {tx.type === "send" ? "Sent" : "Received"}
              </Text>
            </View>
            <Text style={styles.transactionHash}>Hash: {tx.hash}</Text>
            <Text style={styles.transactionDate}>
              Date: {new Date(tx.local_timestamp * 1000).toLocaleString()}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: tx.type === "send" ? "red" : "green" },
              ]}
            >
              Amount: {tx.balanceNano} NANO
            </Text>
          </View>
        ))
      )}
    </>
  );
}
