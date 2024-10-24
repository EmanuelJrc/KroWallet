import "./shim";
import { Buffer } from "@craftzdog/react-native-buffer";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { registerRootComponent } from "expo";
import "react-native-get-random-values";
global.Buffer = Buffer;
// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
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
