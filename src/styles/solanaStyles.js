import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  secretKeyText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceInfo: {
    marginTop: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "regular",
    fontSize: 16,
    paddingTop: 5,
  },
  transactionHistory: {
    marginTop: 20,
    width: "100%",
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  transactionItem: {
    backgroundColor: "#2b2b2b",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountReceived: {
    color: "green",
  },
  amountSent: {
    color: "red",
  },
  transactionAddress: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: "#333",
    width: 70, // Set fixed width
    height: 70, // Set fixed height
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0078FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  walletInfo: {
    marginTop: 30,
    width: "100%",
  },
  balanceText: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  fiatBalanceText: {
    color: "#adadad",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    width: "80%",
    height: 100,
  },
});
