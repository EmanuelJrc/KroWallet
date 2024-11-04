// cryptocurrencies/ethereum/ethereumWallet.js
import { ethers } from "ethers";

// Generate Ethereum Wallet
export function generateEthereumWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Get Balance
export async function getEthereumBalance(address) {
  const provider = ethers.getDefaultProvider("ropsten"); // Use 'mainnet' for production
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance); // Convert balance from wei to ether
}

// Send Transaction
export async function sendEthereumTransaction(privateKey, to, amount) {
  const provider = ethers.getDefaultProvider("ropsten");
  const wallet = new ethers.Wallet(privateKey, provider);
  const transaction = {
    to: to,
    value: ethers.utils.parseEther(amount), // Amount in ether
  };

  const txResponse = await wallet.sendTransaction(transaction);
  await txResponse.wait(); // Wait for transaction confirmation
  return txResponse;
}
