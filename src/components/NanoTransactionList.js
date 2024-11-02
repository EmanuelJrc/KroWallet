import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { styles } from "../styles/stellarStyles";
import { ThemeContext } from "../utils/ThemeContext";

export default function TransactionList({ transactions, userAddress }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [processedTransactions, setProcessedTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setIsLoading(true);
      try {
        const processedTxs = await Promise.all(
          transactions.map(async (tx) => {
            try {
              const response = await axios.post("https://rpc.nano.to", {
                action: "block_info",
                hash: tx.hash,
              });

              const blockData = response.data;
              const isSent = blockData.subtype === "send";

              // For send transactions, use link_as_account from the API response
              // For receive transactions, use the account from the original transaction
              const counterpartyAddress = isSent
                ? blockData.contents.link_as_account
                : tx.account;

              return {
                ...tx,
                ...blockData,
                counterpartyAddress: counterpartyAddress || "Unknown",
                isSent,
                amount_nano: blockData.amount_nano || "0",
              };
            } catch (error) {
              console.error(
                "Error fetching block info for hash:",
                tx.hash,
                error
              );
              return {
                ...tx,
                counterpartyAddress: "Unknown",
                isSent: false,
                amount_nano: "0",
              };
            }
          })
        );

        setProcessedTransactions(processedTxs);
      } catch (error) {
        console.error("Error processing transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (transactions.length > 0) {
      fetchTransactionDetails();
    } else {
      setProcessedTransactions([]);
      setIsLoading(false);
    }
  }, [transactions, userAddress]);

  if (isLoading) {
    return (
      <View style={styles.transactionHistory}>
        <Text style={[styles.transactionTitle, isDarkMode && styles.darkText]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.transactionHistory}>
      <Text style={[styles.transactionTitle, isDarkMode && styles.darkText]}>
        Transaction History
      </Text>
      {processedTransactions.length === 0 ? (
        <Text style={styles.noTransactionText}>No transactions found</Text>
      ) : (
        processedTransactions.map((tx, index) => {
          const displayLabel = tx.isSent
            ? `To: ${tx.counterpartyAddress}`
            : `From: ${tx.counterpartyAddress}`;

          return (
            <View
              key={tx.hash || index}
              style={[
                styles.transactionItem,
                isDarkMode && styles.darkButton,
                tx.isSent ? styles.sentTransaction : styles.receivedTransaction,
              ]}
            >
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionDate}>
                  {new Date(
                    parseInt(tx.local_timestamp, 10) * 1000
                  ).toLocaleDateString()}
                </Text>
                <View style={styles.transactionContent}>
                  <Text
                    style={[
                      styles.transactionType,
                      isDarkMode && styles.darkText,
                    ]}
                  >
                    {tx.isSent ? "Sent" : "Received"}
                  </Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: tx.isSent ? "red" : "green" },
                    ]}
                  >
                    {tx.isSent ? `-${tx.amount_nano}` : `+${tx.amount_nano}`}{" "}
                    NANO
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionHash}>Hash: {tx.hash}</Text>
              <Text style={styles.transactionAddress}>{displayLabel}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}
