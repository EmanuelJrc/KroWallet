import { Buffer } from "@craftzdog/react-native-buffer";
window.Buffer = Buffer;
import { registerRootComponent } from "expo";
// index.js
import "react-native-get-random-values";

// getRandomValues polyfill
class Crypto {
  getRandomValues = this.getRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
