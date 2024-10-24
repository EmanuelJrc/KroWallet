import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  VersionedTransaction,
  Transaction,
  sendAndConfirmTransaction,
  getSignaturesForAddress,
} from "@solana/web3.js";
import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export const createWallet = async () => {
  // Generate a new random keypair
  const keypair = Keypair.generate();
  // Get the public address (wallet address)
  const publicKey = keypair.publicKey.toString();
  const privateKey = bs58.encode(keypair.secretKey);

  console.log("Keypair:", keypair);
  console.log("Public Key:", publicKey);
  console.log("Private Key:", privateKey);

  // Store the wallet securely
  await SecureStore.setItemAsync(
    "solana_wallet",
    JSON.stringify({
      secretKey: Array.from(keypair.secretKey),
      publicKey: publicKey,
    })
  );
  return { keypair, publicKey: keypair.publicKey.toBase58() };
};

// Import wallet using Base58-encoded private key
export const importWallet = async (base58PrivateKey) => {
  try {
    // Decode the Base58 private key to Uint8Array
    const secretKey = bs58.decode(base58PrivateKey);
    const keypair = Keypair.fromSecretKey(secretKey);

    // Store the imported wallet securely
    await SecureStore.setItemAsync(
      "solana_wallet",
      JSON.stringify({
        secretKey: Array.from(keypair.secretKey),
        publicKey: keypair.publicKey.toBase58(),
      })
    );

    console.log("Wallet imported successfully!");
    return { keypair, publicKey: keypair.publicKey.toBase58() };
  } catch (error) {
    console.error("Error importing wallet:", error);
    throw new Error("Failed to import wallet");
  }
};

// Get the balance of the wallet
export const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error("Failed to fetch balance");
  }
};

// Function to send SOL between two accounts
export const sendSolTransaction = async (toAddress, amount) => {
  try {
    // Get the wallet from SecureStore
    const storedWallet = await SecureStore.getItemAsync("solana_wallet");
    if (!storedWallet) {
      throw new Error("Wallet not found");
    }

    // Parse stored wallet
    const { secretKey, publicKey: fromPublicKeyString } =
      JSON.parse(storedWallet);
    const fromKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const fromPublicKey = new PublicKey(fromPublicKeyString);

    // Convert recipient address to PublicKey format
    const toPublicKey = new PublicKey(toAddress);

    // Fetch sender's balance to ensure it has enough SOL
    const senderBalance = await connection.getBalance(fromPublicKey);
    const requiredLamports = amount * LAMPORTS_PER_SOL;

    if (senderBalance < requiredLamports) {
      throw new Error(
        `Insufficient funds: Balance is ${
          senderBalance / LAMPORTS_PER_SOL
        } SOL but ${amount} SOL is required.`
      );
    }

    // Create the transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL, // Amount in lamports
    });

    // Create a new transaction and add the instruction
    const transaction = new Transaction().add(instruction);

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;

    // Sign the transaction
    transaction.sign(fromKeypair);

    // Send and confirm the transaction
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [fromKeypair]
    );

    console.log("Transaction successful! Signature:", txSignature);
    return txSignature;
  } catch (error) {
    console.error("Error sending transaction:", error.message);
    console.error("Stack Trace:", error.stack);
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
};

// Fetch recent transactions for a given public key
export const fetchTransactions = async (publicKey) => {
  try {
    const publicKeyObj = new PublicKey(publicKey);

    // Fetch the confirmed signatures for the address
    const signatures = await connection.getSignaturesForAddress(publicKeyObj, {
      limit: 10, // Adjust the limit based on how many transactions you want to retrieve
    });

    // Fetch transaction details for each signature
    const transactions = await Promise.all(
      signatures.map(async (signatureInfo) => {
        const transaction = await connection.getTransaction(
          signatureInfo.signature
        );
        return transaction;
      })
    );

    console.log("Recent Transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    throw new Error("Failed to fetch recent transactions");
  }
};

export const deleteWallet = async () => {
  try {
    // Remove the wallet from SecureStore
    await SecureStore.deleteItemAsync("solana_wallet");
    console.log("Wallet deleted successfully!");
  } catch (error) {
    console.error("Error deleting wallet:", error);
    throw new Error("Failed to delete wallet");
  }
};

const RecentTransactions = ({ transactions }) => {
  return (
    <>
      <Text style={styles.recent}>Recent Transactions:</Text>
      {transactions.length === 0 ? (
        <Text>No transactions found</Text>
      ) : (
        transactions.map((tx, index) => {
          // Assuming the transaction has a signature and blockTime
          const txType = tx.meta.err ? "send" : "receive"; // Determine type based on error (replace with your logic)
          const amount = tx.meta.preBalances[0] - tx.meta.postBalances[0]; // Adjust to get the actual amount sent/received

          return (
            <View key={index} style={styles.transactionContainer}>
              {/* Icon for transaction type */}
              <View style={styles.transactionHeader}>
                {txType === "send" ? (
                  <Icon name="arrow-up-circle-outline" size={24} color="red" />
                ) : (
                  <Icon
                    name="arrow-down-circle-outline"
                    size={24}
                    color="green"
                  />
                )}
                <Text style={styles.transactionType}>
                  {txType === "send" ? "Sent" : "Received"}
                </Text>
              </View>

              {/* Transaction details */}
              <Text style={styles.transactionHash}>
                Hash: {tx.transaction.signatures[0]}
              </Text>
              <Text style={styles.transactionDate}>
                Date: {new Date(tx.blockTime * 1000).toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: txType === "send" ? "red" : "green" },
                ]}
              >
                Amount: {amount / LAMPORTS_PER_SOL} SOL{" "}
                {/* Convert lamports to SOL */}
                {/* Display transaction fee */}
              </Text>
              <Text style={styles.transactionFee}>
                Fee: {tx.meta.fee / LAMPORTS_PER_SOL} SOL
              </Text>
            </View>
          );
        })
      )}
    </>
  );
};

const styles = StyleSheet.create({
  recent: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transactionContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionType: {
    flexDirection: "row",
    marginLeft: 10,
    fontWeight: "bold",
  },
  transactionHash: {
    marginTop: 5,
    color: "#555",
  },
  transactionDate: {
    marginTop: 5,
    color: "#555",
  },
  transactionAmount: {
    marginTop: 5,
    fontWeight: "bold",
    marginBottom: 5,
  },
  transactionFee: {
    fontSize: 14,
    color: "#888", // Lighter color to differentiate from the amount
    fontStyle: "italic", // Optional for styling emphasis
  },
});

export default RecentTransactions;
