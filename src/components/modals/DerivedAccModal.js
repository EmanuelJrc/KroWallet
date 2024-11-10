import React from "react";
import { View, Text, Modal, Pressable, TextInput, Button } from "react-native";
import { styles } from "../../styles/nanoStyles";

const DerivedAccountsModal = ({
  visible,
  onClose,
  accounts,
  numberOfAccounts,
  setNumberOfAccounts,
  deriveAccounts,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Derived Accounts</Text>

          {/* Display all derived accounts */}
          {accounts.map((account, index) => (
            <View key={index} style={styles.accountContainer}>
              <Text>Account {index + 1}</Text>
              <Text numberOfLines={1} ellipsizeMode="middle">
                Address: {account.address}
              </Text>
            </View>
          ))}

          {/* Input to derive new accounts */}
          <TextInput
            style={styles.input}
            placeholder="Number of accounts to derive"
            keyboardType="numeric"
            onChangeText={(text) => setNumberOfAccounts(parseInt(text) || 1)}
            value={numberOfAccounts.toString()}
          />
          <Button
            title={`Derive ${numberOfAccounts} More Accounts`}
            onPress={() =>
              deriveAccounts(
                accounts.length,
                accounts.length + numberOfAccounts
              )
            }
          />

          {/* Close the modal */}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(DerivedAccountsModal);
