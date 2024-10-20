import { getAccountHistory } from "../../utils/banano/bananoApi"; // Import the function to get history
import { tools } from "bananocurrency-web"; // Import Nano conversion tools

// Function to fetch and convert transactions from RAW to NANO
export const fetchAndConvertTransactions = async (address) => {
  try {
    const accountHistory = await getAccountHistory(address);

    // If the account has no transactions, return an empty array
    if (!accountHistory || !accountHistory.history) {
      return [];
    }

    // Map through transactions and convert the amount to NANO
    const transactionsInNano = accountHistory.history.map((tx) => ({
      ...tx,
      balanceNano: parseFloat(tools.convert(tx.amount, "RAW", "BAN")).toFixed(
        4
      ),
    }));

    return transactionsInNano;
  } catch (error) {
    console.log("Error fetching or converting transactions:", error);
    throw error; // Optionally handle this error in the UI or elsewhere
  }
};
