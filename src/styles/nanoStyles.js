import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
  },
  container: {
    flexGrow: 2,
    justifyContent: "flex-end",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f1f1f1",
  },
  barcodeScanner: {
    width: "100%",
    height: "80%",
  },
  detailIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  darkText: {
    color: "#ffffff",
    fontSize: 24,
    marginBottom: 10,
  },
  modalView: {
    marginTop: "30%",
    margin: 20,
    backgroundColor: "#333333",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
  },
  sendModalView: {
    width: "90%",
    marginTop: "30%",
    backgroundColor: "#333333",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white", // Softer black
  },
  sendButton: {
    backgroundColor: "#28A745", // Green for success action
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  sendButtonClose: {
    backgroundColor: "#dc3545", // Red for closing action
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  inputField: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: "#000000",
    placeholderTextColor: "#000000",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#f44336",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  addressText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
  },
  balanceText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  recent: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  transactionContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  transactionHash: {
    fontSize: 14,
    color: "#666",
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  noTransactionsText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
  },
  receivingStatusText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 5,
  },
});
