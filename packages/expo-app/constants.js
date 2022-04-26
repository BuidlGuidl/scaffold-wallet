// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "460f40a260564ac4a4f4b3fffb032dad";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const ALCHEMY_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export const NETWORKS = {
  // localhost: {
  //   name: "localhost",
  //   color: "#f01a37",
  //   chainId: 31337,
  //   blockExplorer: "",
  //   rpcUrl: "http://localhost" + ":8545",
  // },
  ethereum: {
    name: "ethereum",
    color: "#333333",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    chainId: 10,
    blockExplorer: "https://optimistic.etherscan.io/",
    rpcUrl: `https://mainnet.optimism.io`,
  },
  arbitrum: {
    name: "arbitrum",
    color: "#50a0ea",
    chainId: 42161,
    blockExplorer: "https://arbiscan.io/",
    rpcUrl: `https://arb1.arbitrum.io/rpc`,
    gasPrice: 0,
  },
  gnosis: {
    name: "gnosis",
    color: "#48a9a6",
    chainId: 100,
    price: 1,
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
      logoURI: "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    },
    gasPrice: 1000000000,
    rpcUrl: "https://rpc.gnosischain.com/",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
  },
  polygon: {
    name: "polygon",
    color: "#2bbdf7",
    nativeCurrency: {
      uniswap: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
      logoURI: "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png",
    },
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com//",
  },
  kovan: {
    name: "kovan",
    color: "#7003DD",
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
  rinkeby: {
    name: "rinkeby",
    color: "#50a0ea",
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
  },
  ropsten: {
    name: "ropsten",
    color: "#F60D09",
    chainId: 3,
    faucet: "https://faucet.ropsten.be/",
    blockExplorer: "https://ropsten.etherscan.io/",
    rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    nativeCurrency: {
      uniswap: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
      logoURI: "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png",
    },
    chainId: 80001,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.polygon.technology/",
    blockExplorer: "https://mumbai.polygonscan.com/",
  },
  // localArbitrum: {
  //   name: "localArbitrum",
  //   color: "#50a0ea",
  //   chainId: 153869338190755,
  //   blockExplorer: "",
  //   rpcUrl: `http://localhost:8547`,
  // },
  // localArbitrumL1: {
  //   name: "localArbitrumL1",
  //   color: "#50a0ea",
  //   chainId: 44010,
  //   blockExplorer: "",
  //   rpcUrl: `http://localhost:7545`,
  // },
  // rinkebyArbitrum: {
  //   name: "rinkebyArbitrum",
  //   color: "#50a0ea",
  //   chainId: 421611,
  //   blockExplorer: "https://rinkeby-explorer.arbitrum.io/#/",
  //   rpcUrl: `https://rinkeby.arbitrum.io/rpc`,
  // },
  // localOptimismL1: {
  //   name: "localOptimismL1",
  //   color: "#f01a37",
  //   chainId: 31337,
  //   blockExplorer: "",
  //   rpcUrl: "http://localhost:9545",
  // },
  // localOptimism: {
  //   name: "localOptimism",
  //   color: "#f01a37",
  //   chainId: 420,
  //   blockExplorer: "",
  //   rpcUrl: "http://localhost:8545",
  //   gasPrice: 0,
  // },
  // kovanOptimism: {
  //   name: "kovanOptimism",
  //   color: "#f01a37",
  //   chainId: 69,
  //   blockExplorer: "https://kovan-optimistic.etherscan.io/",
  //   rpcUrl: `https://kovan.optimism.io`,
  //   gasPrice: 0,
  // },
  // localAvalanche: {
  //   name: "localAvalanche",
  //   color: "#666666",
  //   chainId: 43112,
  //   blockExplorer: "",
  //   rpcUrl: `http://localhost:9650/ext/bc/C/rpc`,
  //   gasPrice: 225000000000,
  // },

  // mainnetAvalanche: {
  //   name: "mainnetAvalanche",
  //   color: "#666666",
  //   chainId: 43114,
  //   blockExplorer: "https://cchain.explorer.avax.network/",
  //   rpcUrl: `https://api.avax.network/ext/bc/C/rpc`,
  //   gasPrice: 225000000000,
  // },
  // fujiAvalanche: {
  //   name: "fujiAvalanche",
  //   color: "#666666",
  //   chainId: 43113,
  //   blockExplorer: "https://cchain.explorer.avax-test.network/",
  //   rpcUrl: `https://api.avax-test.network/ext/bc/C/rpc`,
  //   gasPrice: 225000000000,
  // },
  // mainnetHarmony: {
  //   name: "mainnetHarmony",
  //   color: "#00b0ef",
  //   chainId: 1666600000,
  //   blockExplorer: "https://explorer.harmony.one/",
  //   rpcUrl: `https://api.harmony.one`,
  //   gasPrice: 1000000000,
  // },
  // testnetHarmony: {
  //   name: "testnetHarmony",
  //   color: "#00b0ef",
  //   chainId: 1666700000,
  //   blockExplorer: "https://explorer.pops.one/",
  //   rpcUrl: `https://api.s0.b.hmny.io`,
  //   gasPrice: 1000000000,
  // },
  // fantom: {
  //   name: "fantom",
  //   color: "#1969ff",
  //   chainId: 250,
  //   blockExplorer: "https://ftmscan.com/",
  //   rpcUrl: `https://rpcapi.fantom.network`,
  //   gasPrice: 1000000000,
  // },
  // testnetFantom: {
  //   name: "testnetFantom",
  //   color: "#1969ff",
  //   chainId: 4002,
  //   blockExplorer: "https://testnet.ftmscan.com/",
  //   rpcUrl: `https://rpc.testnet.fantom.network`,
  //   gasPrice: 1000000000,
  //   faucet: "https://faucet.fantom.network/",
  // },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const DROPDOWN_NETWORK_OPTIONS = [];
for (const id in NETWORKS) {
  DROPDOWN_NETWORK_OPTIONS.push(
    { label: NETWORKS[id].name, value: NETWORKS[id].name }
  );
}

// RPC Call Methods. From Rainbow https://github.com/rainbow-me/rainbow/blob/develop/src/utils/signingMethods.ts
export const SEND_TRANSACTION = 'eth_sendTransaction';
export const PERSONAL_SIGN = 'personal_sign';
export const SIGN = 'eth_sign';
export const SIGN_TRANSACTION = 'eth_signTransaction';
export const SIGN_TYPED_DATA = 'eth_signTypedData';
export const SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4';