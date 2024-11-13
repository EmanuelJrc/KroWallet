import axios from "axios";

const BLOCKCHAIN_API_URL = "https://blockchain.info/rawaddr/";

class BlockchainAPI {
  static async getTransactions(walletAddress) {
    try {
      const response = await axios.get(
        `${BLOCKCHAIN_API_URL}${walletAddress}?limit=50&offset=0&filter=0&format=json`
      );
      return this.formatTransactionData(response.data.txs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }

  static async getBalance(walletAddress) {
    try {
      const response = await axios.get(
        `${BLOCKCHAIN_API_URL}${walletAddress}?format=json`
      );
      return response.data.final_balance / 100000000; // Convert satoshis to BTC
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  }

  static formatTransactionData(rawTransactions) {
    return rawTransactions.map((tx) => ({
      txid: tx.hash,
      amount: tx.result / 100000000, // Convert satoshis to BTC
      time: tx.time,
      confirmations: tx.block_height ? tx.block_height - tx.block_index + 1 : 0,
    }));
  }
}

export { BlockchainAPI };
