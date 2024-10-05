import axios from "axios";
import { tools, block } from "nanocurrency-web";

// Replace with your RPC node URL
const NODE_URL = "https://rpc.nano.to";

export const getAccountBalance = async (address) => {
  const response = await axios.post(`${NODE_URL}`, {
    action: "account_balance",
    account: address,
  });
  const balanceRaw = response.data.balance;
  const balanceNano = tools.convert(balanceRaw, "RAW", "NANO");
  const roundedBalance = parseFloat(balanceNano).toFixed(4);
  return roundedBalance;
};

export const getAccountHistory = async (address) => {
  const response = await axios.post(NODE_URL, {
    action: "account_history",
    account: address,
    count: "5",
  });
  return response.data;
};

export const sendTransaction = async (signedBlock) => {
  try {
    const response = await axios.post(NODE_URL, {
      action: "process",
      block: signedBlock,
      json_block: "true", // Ensure the block is in JSON format
    });

    if (response.data.hash) {
      console.log("Transaction sent successfully:", response.data.hash);
      return response.data;
    } else {
      console.error("Transaction failed:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};

export const receiveTransaction = async (block) => {
  const response = await axios.post(`${NODE_URL}`, {
    action: "process",
    block: block,
  });
  return response.data;
};
