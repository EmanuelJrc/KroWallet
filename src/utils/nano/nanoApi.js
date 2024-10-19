import axios from "axios";
import { tools, block } from "nanocurrency-web";

// Replace with your RPC node URL
const NODE_URL = "https://rpc.nano.to";

export const generateWork = async (frontier) => {
  try {
    const response = await axios.post(NODE_URL, {
      action: "work_generate",
      hash: frontier, // Use the actual frontier hash
      key: "RPC-KEY-BF04CC20622E43DEBD5A7C7C042DAB",
    });

    if (response.data.error) {
      throw new Error(`Error generating work: ${response.data.error}`);
    }

    return response.data.work; // Return the generated work
  } catch (error) {
    console.error("Error in work generation:", error);
    throw error;
  }
};

export const getAccountInfo = async (address) => {
  try {
    console.log("Fetching account info for address:", address);
    const response = await axios.post(NODE_URL, {
      action: "account_info",
      account: address,
    });
    console.log("Account info response:", response.data);

    if (response.data.error === "Account not found") {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error getting account info:", error);
    throw error;
  }
};

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
      json_block: "true",
      subtype: "receive",
      block: signedBlock,
    });

    console.log("Process response:", response.data);

    if (response.data && response.data.hash) {
      console.log("Transaction processed successfully:", response.data.hash);
      return response.data;
    } else {
      console.error("Unexpected response from node:", response.data);
      throw new Error("No transaction hash in response");
    }
  } catch (error) {
    console.error(
      "Error sending transaction:",
      error.response ? error.response.data : error.message
    );
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

export const checkForReceivableTransactions = async (address) => {
  try {
    console.log("Checking receivable transactions for address:", address); // Log the address
    const response = await axios.post(NODE_URL, {
      action: "account_info",
      account: address,
    });

    if (response.data.error) {
      console.log("Account Info Response:", response.data);
      console.error("Error fetching account info:", response.data.error);
      return null;
    }

    return response.data; // This will contain information like frontier
  } catch (error) {
    console.error("Error fetching account info:", error);
    return null;
  }
};

// Function to handle receiving transactions
export const handleReceivableTransactions = async (address, privateKey) => {
  console.log("Checking receivable transactions for address:", address);

  const response = await axios.post(NODE_URL, {
    action: "receivable",
    account: address,
    count: "10",
    source: "true",
    threshold: "1",
  });

  console.log("Receivable response:", response.data);

  if (!response.data.blocks || Object.keys(response.data.blocks).length === 0) {
    console.log("No receivable transactions found");
    return [];
  }

  const receivableBlocks = response.data.blocks;
  const processedBlocks = [];

  for (const [hash, details] of Object.entries(receivableBlocks)) {
    const accountInfo = await getAccountInfo(address);
    console.log("Fetched Account info:", accountInfo);

    if (!accountInfo || accountInfo.error === "Account not found") {
      console.log(
        "Account not found or not initialized, skipping block preparation."
      );
      continue; // Skip processing if account is not found
    }

    const workHash = accountInfo.frontier || tools.addressToPublicKey(address);
    const work = await generateWork(workHash);

    const blockData = {
      walletBalanceRaw: accountInfo ? accountInfo.balance : "0",
      fromAddress: details.source,
      toAddress: address,
      representativeAddress:
        "nano_1anrzcuwe64rwxzcco8dkhpyxpi8kd7zsjc1oeimpc3ppca4mrjtwnqposrs",
      amountRaw: details.amount,
      work: work,
      previous:
        "0000000000000000000000000000000000000000000000000000000000000000",
    };

    console.log("Preparing to receive block:", blockData);

    const signedBlock = block.receive(blockData, privateKey);
    console.log("Signed block:", signedBlock); // Log the signed block to inspect it

    const processResponse = await sendTransaction(signedBlock);
    console.log("Process response:", processResponse);

    if (processResponse && processResponse.hash) {
      processedBlocks.push(processResponse.hash);
      console.log("Block received successfully:", processResponse.hash);
    } else {
      console.log("Failed to process block:", processResponse);
    }
  }

  return processedBlocks;
};
