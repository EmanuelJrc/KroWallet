// import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "@bitcoinerlab/secp256k1";
import axios from "axios";

export const generateWallet = () => {
  const keyPair = ecc.makeRandom(); // Generate a random private key
  const { address } = payments.p2pkh({ pubkey: keyPair.publicKey });

  const privateKey = keyPair.toWIF(); // Wallet Import Format for the private key

  return {
    address,
    privateKey,
  };
};
