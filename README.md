# **Crypto Wallet - KroWallet**

This is a cross-platform mobile application that supports multiple cryptocurrencies. The app is built using React Native and is designed to provide a seamless experience for users to manage their crypto assets securely from their mobile devices. The initial release includes support for Nano, Banano, Dogecoin, Bitcoin, and Solana, with more currencies to be added in the future.

## **Features**

- **Multi-Cryptocurrency Support**  
  The wallet app currently supports:
  - **Nano**
  - **Banano**
  - **Dogecoin**
  - **Bitcoin**
  - **Solana**
  
  Each cryptocurrency's implementation is handled uniquely while maintaining a consistent interface and user experience across the app.
  
- **Secure On-Device Key Management**  
  All private keys and sensitive data are stored securely on the user's device using expo secure-store, never transmitted to external servers.

- **Send and Receive Transactions**  
  The app allows users to seamlessly send and receive crypto transactions for each supported cryptocurrency. The transaction fees and status (sent/received) are displayed clearly.

- **Transaction History and Balance**  
  Users can view their transaction history and current balance, with transactions appropriately labeled for clarity.

- **Deriving New Accounts**  
  For cryptocurrencies like Nano, the app supports deriving multiple accounts from a seed. Users can generate new accounts within their wallet at any time.

- **Convert Crypto Units**  
  Convert between different units (e.g., from Nano to RAW) for cryptocurrencies that support multiple denominations.

## **Getting Started**

### **Prerequisites**

- **Bun**  
  This project uses **Bun** as the package manager instead of npm. Ensure you have [Bun installed](https://bun.sh/).

  ```bash
  bun install
  ```

- **React Native**  
  Follow the official [React Native setup instructions](https://reactnative.dev/docs/environment-setup) to configure your development environment.

- **Expo**  
  We use Expo for easier development and testing. Keep in mind some features don't work with Expo go when testing.

### **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/EmanuelJrc/KroWallet.git
   cd KroWallet
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun start
   ```

### **Supported Cryptocurrencies**

The app currently supports the following cryptocurrencies:

- **Nano**: Using `nanocurrency-web` for managing wallets, signing transactions, and sending/receiving NANO.
- **Banano**: Banano support is built similarly to Nano, using a custom implementation.
- **Dogecoin**: Basic transaction management and signing support.
- **Bitcoin**: Bitcoin transactions are handled using `@bitauth/libauth`.
- **Solana**: Implemented with a feature-rich transaction handling for sending/receiving SOL.

Each cryptocurrency has its own module inside the `crypto` folder, making it easy to add new cryptocurrencies in the future.

### **Contributing**

We welcome contributions from the community! Whether it's improving the existing code, adding new features, or extending support to additional cryptocurrencies, we’d love to have your help.  

#### **How to Contribute**

1. Fork this repository
2. Create a new branch for your feature or bugfix:  
   `git checkout -b feature-name`
3. Make your changes and commit them:  
   `git commit -m 'Add some feature'`
4. Push your branch to your fork:  
   `git push origin feature-name`
5. Submit a pull request

Feel free to open issues for discussion and suggestions.

### **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
