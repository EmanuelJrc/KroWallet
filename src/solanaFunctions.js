import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Transaction,
  TransactionConfirmationStrategy,
} from "@solana/web3.js";
import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";

const connection = new Connection("https://api.devnet.solana.com");

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
  }
};

export const sendTransaction = async (fromKeypair, toAddress, amount) => {
  try {
    // Convert stored secretKey back to Uint8Array
    const fromSecretKey = Uint8Array.from(fromKeypair.secretKey);
    const keypair = Keypair.fromSecretKey(fromSecretKey);

    const toPublicKey = new PublicKey(toAddress);

    console.log("Sending SOL to:", toPublicKey.toString());
    console.log("Amount:", amount);
    console.log("From Keypair:", keypair);
    console.log("Connection:", connection);
    console.log("Transaction:", transaction);

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    const transaction = new VersionedTransaction({
      recentBlockhash: blockhash,
      feePayer: keypair.publicKey,
    });

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: toPublicKey,
        lamports: amount, // Amount in lamports
      })
    );

    // Sign the transaction
    transaction.sign([keypair]);

    // Send the transaction
    const signature = await connection.sendTransaction(transaction, [keypair]);

    // Confirm the transaction
    await connection.TransactionConfirmationStrategy(signature, "processed");

    console.log("Transaction successful, signature: ", signature);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
};
