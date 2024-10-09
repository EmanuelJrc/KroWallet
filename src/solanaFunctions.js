import * as solanaWeb3 from "@solana/web3.js";

export const createWallet = async () => {
  // Generate a new random keypair
  const keypair = solanaWeb3.Keypair.generate();

  // Get the public address (wallet address)
  const publicKey = keypair.publicKey.toString();

  console.log("Public Key:", publicKey);
  return { publicKey, keypair };
};

export const getBalance = async (publicKey) => {
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("devnet")
  );

  const balance = await connection.getBalance(
    new solanaWeb3.PublicKey(publicKey)
  );

  console.log("Balance:", balance);
  return balance;
};

export const sendTransaction = async (fromKeypair, toPublicKey, amount) => {
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("devnet")
  );

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new solanaWeb3.PublicKey(toPublicKey),
      lamports: amount, // Amount in lamports (1 SOL = 1e9 lamports)
    })
  );

  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromKeypair]
  );
  console.log("Transaction Signature:", signature);
  return signature;
};
