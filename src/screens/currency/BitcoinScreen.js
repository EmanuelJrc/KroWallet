import BdkRn, {
  DescriptorSecretKey,
  Mnemonic,
  Blockchain,
  Wallet,
  DatabaseConfig,
  Descriptor,
} from "bdk-rn";
import { WordCount, Network, KeychainKind } from "bdk-rn/lib/lib/enums";
import React, { Fragment, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  Image,
  Button,
} from "react-native";
import { styles } from "../../styles/styles";
import bitcoinLogo from "../../../assets/bitcoin_logo.png";
import bdkLogo from "../../../assets/bdk_logo.png";
export default function BitcoinScreen() {
  const [mnemonic, setMnemonic] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [balance, setBalance] = useState();
  const [wallet, setWallet] = useState();
  const [syncResponse, setSyncResponse] = useState();
  const [address, setAddress] = useState();
  const [transaction, setTransaction] = useState();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState();

  const getMnemonic = async () => {
    try {
      const mnemonicInstance = await new Mnemonic().create(WordCount.WORDS12);
      const mnemonicData = mnemonicInstance;
      setMnemonic(mnemonicData);
      setDisplayText(JSON.stringify(mnemonicData));
    } catch (error) {
      console.error("Error generating mnemonic:", error);
      setDisplayText("Failed to generate mnemonic.");
    }
  };

  const createWallet = async () => {
    try {
      const descriptorSecretKey = await new DescriptorSecretKey().create(
        Network.Testnet,
        mnemonic
      );
      const externalDescriptor = await new Descriptor().newBip84(
        descriptorSecretKey,
        KeychainKind.External,
        Network.Testnet
      );
      const internalDescriptor = await new Descriptor().newBip84(
        descriptorSecretKey,
        KeychainKind.Internal,
        Network.Testnet
      );

      const config = {
        url: "ssl://electrum.blockstream.info:60002",
        sock5: null,
        retry: 5,
        timeout: 5,
        stopGap: 100,
        validateDomain: false,
      };

      const dbConfig = await new DatabaseConfig().memory(); // In-memory DB for simplicity, but can be persisted
      const walletInstance = await new Wallet().create(
        externalDescriptor,
        internalDescriptor,
        Network.Testnet,
        dbConfig
      );

      setWallet(walletInstance);
      setDisplayText(JSON.stringify(walletInstance));
    } catch (error) {
      console.error("Error creating wallet:", error);
      setDisplayText("Failed to create wallet.");
    }
  };

  const syncWallet = async () => {
    try {
      const config = {
        url: "ssl://electrum.blockstream.info:60002",
        sock5: null,
        retry: 5,
        timeout: 5,
        stopGap: 100,
        validateDomain: false,
      };

      const blockchain = await new Blockchain().create(config);
      await wallet.sync(blockchain);
      setSyncResponse("Wallet synchronized successfully");
    } catch (error) {
      console.error("Error syncing wallet:", error);
      setDisplayText("Failed to sync wallet.");
    }
  };

  const getBalance = async () => {
    try {
      const { data } = await wallet.getBalance(); // Assuming wallet instance provides getBalance()
      setBalance(data);
      setDisplayText(`Balance: ${data}`);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setDisplayText("Failed to fetch balance.");
    }
  };

  const getAddress = async () => {
    try {
      if (!wallet) {
        setDisplayText("Wallet not initialized.");
        return;
      }
      const { address } = await wallet.getAddress(); // Assuming wallet instance provides getAddress()
      setAddress(address);
      setDisplayText(`Address: ${address}`);
    } catch (error) {
      console.error("Error generating address:", error);
      setDisplayText("Failed to generate address.");
    }
  };

  const sendTx = async () => {
    try {
      const { data } = await BdkRn.quickSend({
        address: recipient,
        amount: amount,
      });
      setTransaction(data);
      setDisplayText(JSON.stringify(data));
    } catch (error) {
      console.error("Error sending transaction:", error);
      setDisplayText("Failed to send transaction.");
    }
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Image
            style={{ resizeMode: "stretch", height: 36, width: 36 }}
            source={bitcoinLogo}
          />
          <Text style={styles.headerText}>BDK-RN Tutorial</Text>
          <Image
            style={{ resizeMode: "center", height: 40, width: 25 }}
            source={bdkLogo}
          />
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceText} selectable>
            {"Balance: "}
          </Text>
          <Text selectable>{balance ? balance : "0"} Sats</Text>
        </View>

        {/* method call result */}
        {displayText && (
          <View style={styles.responseSection}>
            <Text style={styles.responseText} selectable>
              Response:
            </Text>
            <Text selectable>{displayText}</Text>
          </View>
        )}

        {/* buttons for method calls */}
        <View style={styles.methodSection}>
          <Button
            title="Generate Mnemonic"
            style={styles.methodButton}
            onPress={getMnemonic}
          />
          <TextInput
            style={styles.input}
            multiline
            value={mnemonic}
            onChangeText={setMnemonic}
            textAlignVertical="top"
          />
          <Button
            title="Create Wallet"
            style={styles.methodButton}
            onPress={createWallet}
          />
          <Button
            title="Sync Wallet"
            style={styles.methodButton}
            onPress={syncWallet}
          />
          <Button
            title="Get Balance"
            style={styles.methodButton}
            onPress={getBalance}
          />
          <Button
            title="Get Address"
            style={styles.methodButton}
            onPress={getAddress}
          />
        </View>

        {/* input boxes and send transaction button */}
        <View style={styles.sendSection}>
          <Fragment>
            <TextInput
              style={styles.input}
              placeholder="recipient Address"
              onChangeText={setRecipient}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (in sats)"
              onChangeText={(e) => setAmount(parseInt(e))}
            />
            <Button
              title="Send Transaction"
              style={styles.methodButton}
              onPress={sendTx}
            />
          </Fragment>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
