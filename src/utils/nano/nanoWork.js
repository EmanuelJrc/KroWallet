import axios from "axios";

const NODE_URL = "https://rpc.nano.to"; // Replace with your preferred RPC node URL

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
