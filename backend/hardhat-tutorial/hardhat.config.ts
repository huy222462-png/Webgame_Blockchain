import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    Hera: {
      type: "http",
      chainType: "l1",
      url: "https://testnet.hashio.io/api",
      // Use a private key (0x-prefixed) or a config variable; never put a public address here.
      accounts: [("0x61781bb7dd52d006b62d49c62828d93a41108d3de1917fea89dc8011a8525465")],
    },
  },
});
