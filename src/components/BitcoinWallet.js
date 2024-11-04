// // bitcoinWallet.js
// import {
//   getAddress,
//   getScriptHash,
//   getPrivateKey,
// } from "react-native-address-generator";

// // Configuration
// const mnemonic =
//   "lazy rally chat way pet outside flame cup oval absurd innocent balcony";
// const passphrase = "passphrase";
// const path = "m/84'/1'/0'/0/0"; // BIP84 path for P2WPKH on testnet
// const network = "testnet";

// /**
//  * Generate Bitcoin wallet address
//  * @returns {Promise<{address: string, pubkey: string} | null>}
//  */
// export async function generateAddress() {
//   const getAddressRes = await getAddress({
//     mnemonic,
//     path,
//     network,
//     passphrase,
//   });
//   if (getAddressRes.isErr()) {
//     console.error("Error generating address:", getAddressRes.error.message);
//     return null;
//   }
//   return getAddressRes.value;
// }

// /**
//  * Generate script hash for a Bitcoin address
//  * @param {string} address
//  * @returns {Promise<string | null>}
//  */
// export async function generateScriptHash(address) {
//   const getScriptHashRes = await getScriptHash({ address, network });
//   if (getScriptHashRes.isErr()) {
//     console.error(
//       "Error generating script hash:",
//       getScriptHashRes.error.message
//     );
//     return null;
//   }
//   return getScriptHashRes.value;
// }

// /**
//  * Retrieve private key for Bitcoin wallet
//  * @returns {Promise<string | null>}
//  */
// export async function getWalletPrivateKey() {
//   const getPrivateKeyRes = await getPrivateKey({
//     mnemonic,
//     path,
//     network,
//     passphrase,
//   });
//   if (getPrivateKeyRes.isErr()) {
//     console.error(
//       "Error retrieving private key:",
//       getPrivateKeyRes.error.message
//     );
//     return null;
//   }
//   return getPrivateKeyRes.value;
// }
