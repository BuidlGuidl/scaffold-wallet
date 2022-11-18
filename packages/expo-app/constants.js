// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "95ff362df12840c98fa418bcd4b27c8a";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const ALCHEMY_KEY = "ILgLjMfyYWzqAYmOGlJxz0DHo_EFwHN_";

export const NETWORKS = {
  ethereum: {
    name: "ethereum",
    color: "#333333",
    chainId: 1,
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    blockExplorer: "https://etherscan.io/",
  },
  optimism: {
    name: "optimism",
    color: "#f01a37",
    chainId: 10,
    blockExplorer: "https://optimistic.etherscan.io/",
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/gzr_xuzv2SPwbPchC9Z41qmfodlDglKp`,
    // rpcUrl: `https://mainnet.optimism.io`,
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