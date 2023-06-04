import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Linking, Image, Text } from "react-native";
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import {
  NETWORKS,
  ALCHEMY_KEY,
  SEND_TRANSACTION,
  PERSONAL_SIGN,
  SIGN_TRANSACTION,
  NETWORK_IMAGES,
  SIGN,
  SIGN_TYPED_DATA_V4,
  ETHERSCAN_KEY,
  SIGN_TYPED_DATA,
  isChainIdHistoryBlocked,
} from "./constants";
// Polyfill for localStorage
import "./helpers/windows";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";
import { useStaticJsonRPC } from "./hooks";
import useGasPrice from "./hooks/GasPrice";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntIcon from "react-native-vector-icons/AntDesign";
import RNRestart from "react-native-restart";
import { signTypedData } from "@metamask/eth-sig-util";
import { toBuffer } from "ethereumjs-util";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens and Components
import { QRScannerScreen } from "./screens/QRScannerScreen";
import { QRScreen } from "./screens/QRScreen";
import { WalletsScreen } from "./screens/WalletsScreen";
import { SendScreen } from "./screens/SendScreen";
import {
  extractJSONRPCMessage,
  generateWallet,
  loadWallet,
} from "./helpers/utils";
import { LogBox } from "react-native";
import { updateStorageTransaction } from "./helpers/Transactions";
import useExchangePrice from "./hooks/ExchangePrice";
import useBalance from "./hooks/Balance";
import ErrorDisplay from "./components/ErrorDisplay";
import { NavigationContainer } from "@react-navigation/native";
import { HomeScreen } from "./screens/HomeScreen";
import { WalletConnectScreen } from "./screens/WalletConnectScreen";
import LinearGradient from "react-native-linear-gradient";

const initialNetwork = NETWORKS.ethereum; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];
const ScaffoldEthWalletLogo = require("./assets/scaffoldEthWalletLogo.png");

const AppStack = createNativeStackNavigator();
export default function App() {
  LogBox.ignoreLogs(["Setting a timer"]); // Ignore log notification by message
  const [address, setAddress] = useState();
  const [ensName, setEnsName] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork.name);

  const targetNetwork = NETWORKS[selectedNetwork];

  // load all your providers
  const localProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);
  const mainnetProvider = useStaticJsonRPC(providers);

  // NOTE: These are custom hooks built on top of eth-hooks
  // for finer control of over network changes and intervals
  const price = useExchangePrice(targetNetwork, mainnetProvider, 30000);
  const gasPrice = useGasPrice(targetNetwork, 10000);
  const yourLocalBalance = useBalance(targetNetwork, address, 10000);
  let isFetchingHistoryData = false;
  const [showTransactionScreen, setShowTransactionScreen] = useState(false);
  // const showTransaction = useCallback(() => setShowTransactionScreen(true), [])
  const hideTransaction = useCallback(
    () => setShowTransactionScreen(false),
    []
  );
  const lookupAddress = async (addressToCheck) => {
    const ensResult = await mainnetProvider.lookupAddress(
      addressToCheck
    );
    return ensResult
  };



  const [wallet, setWallet] = useState();
  const [toAddress, setToAddress] = useState();
  const [ensNameToAddress, setEnsNameToAddress] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [pendingTransaction, setPendingTransaction] = useState();
  const [transactionHistory, setTransactionHistory] = useState([]);

  const [errorMessage, setErrorMessage] = useState(null);
  const [walletConnectUrl, setWalletConnectUrl] = useState();
  const [wallectConnectConnector, setWallectConnectConnector] = useState();
  const [walletConnectParams, setWalletConnectParams] = useState();
  const [walletConnectNetwork, setWalletConnectNetwork] = useState();
  const [loadingStatus, setLoadingStatus] = useState("started");
  const refreshApp = () => RNRestart.Restart();



  const sendEth = async (ethAmount, to) => {
    const signer = wallet.connect(localProvider);

    try {
      // const testGasPrice = new ethers.BigNumber.from('4000000000') //4gwei
      const txConfig = {
        gasPrice: gasPrice,
        // gasLimit: 21000, // Gas limit breaks send on Arbitrum for some reason
        to: to,
        value: ethers.utils.parseEther(ethAmount),
      };
      console.log(txConfig);
      const txn = await signer.sendTransaction(txConfig);
      await updateStorageTransaction(txn);
      console.log("Send successful!");
    } catch (err) {
      console.log("sendEth error", err);
      const message = extractJSONRPCMessage(err.error.message);
      displayErrorMessage(message);
    }
  };

  const connect = (url) => {
    console.log("connect", url);
    if (url) {
      const connector = new WalletConnect({
        uri: url,
        clientMeta: {
          description: "Forkable Mobile Wallet for small/quick transactions.",
          url: "https://punkwallet.io",
          icons: ["https://punkwallet.io/punk.png"],
          name: "🧑‍🎤 PunkWallet.io",
        },
      });

      // Check if connection is already established
      if (!connector.connected) connector.createSession();

      setWallectConnectConnector(connector);

      // Subscribe to session requests
      connector.on("session_request", (error, payload) => {
        console.log("session_request", payload);
        if (error) throw error;

        if (payload.params && payload.params.length > 0) {
          setWalletConnectParams(payload.params[0]);
          setWalletConnectNetwork(targetNetwork);
        }

        connector.approveSession({
          accounts: [address],
          chainId: targetNetwork.chainId,
        });
      });

      // Subscribe to call requests
      connector.on("call_request", async (error, payload) => {
        console.log("call_request", payload);
        if (error) throw error;

        setPendingTransaction(payload);
        setShowTransactionScreen(true);
      });

      connector.on("disconnect", async (error, payload) => {
        console.log("disconnect", payload);
        if (error) console.log(error);

        setWalletConnectUrl(undefined);
        setWallectConnectConnector(undefined);
        setWalletConnectParams(undefined);
        setWallectConnectNetwork(undefined);

        // Force reload the JS bundle to clear WC stuff
        refreshApp();
      });
    }
  };
  const modifyToAddress = (newAddress) => {
    if(!newAddress){
      setEnsNameToAddress(undefined) 
      setToAddress(undefined)
      return
    }
    setToAddress(newAddress)
    const validToAddress = newAddress ? ethers.utils.isAddress(newAddress) : false;
    if(!validToAddress){
      if(newAddress.includes(".eth")){
        mainnetProvider.getResolver(newAddress).then((res) =>{
          setEnsNameToAddress(res.name)
          setToAddress(res.address)
        })
        return
      }
      setEnsNameToAddress()
      return
    }
    lookupAddress(newAddress).then((ensResult)=>{
      setEnsNameToAddress(ensResult)
    })
    
  }

  const disconnect = async () => {
    try {
      await wallectConnectConnector.killSession();
    } catch (err) {
      console.log("killSession failed", err);

      // Force reload the JS bundle to clear WC stuff
      refreshApp();
    }
  };

  const confirmTransaction = async () => {
    const payload = pendingTransaction;
    const method = payload.method;
    console.log("confirmTransaction", targetNetwork.rpcUrl, payload);
    try {
      // ============= Handle Sending / Signing a transaction =============
      if (method === SEND_TRANSACTION || method === SIGN_TRANSACTION) {
        const signer = wallet.connect(localProvider);
        const { to, from, data, value } = payload.params[0];
        const tx = {
          from,
          to,
          gasPrice: gasPrice,
          value,
          data,
        };

        console.log("tx", tx);
        let hash;
        if (method === SEND_TRANSACTION) {
          const updatedTxn = await signer.sendTransaction(tx);
          await updateStorageTransaction(updatedTxn);
          hash = updatedTxn.hash;
          console.log(hash);
          console.log("Transaction Sent");
        } else {
          hash = await signer.signTransaction(tx);
          console.log("Transaction Signed");
        }

        wallectConnectConnector.approveRequest({
          id: payload.id,
          result: hash,
        });
        console.log("Sent ApproveRequest back to Wallet Connect");
        setPendingTransaction(undefined);
      }
      // ============= Handle Personal Sign and Sign =============
      else if (method === PERSONAL_SIGN || method === SIGN) {
        const message =
          method === PERSONAL_SIGN ? payload.params?.[0] : payload.params?.[1];
        const result = await wallet.signMessage(arrayify(message));
        console.log(result);
        await wallectConnectConnector.approveRequest({
          id: payload.id,
          result,
        });
        setPendingTransaction(undefined);
      }
      // ============= Handle TypedData Signing =============
      // Adapted from Rainbow's Signing Code
      // https://github.com/rainbow-me/rainbow/blob/develop/src/model/wallet.ts#L386
      else if (method === SIGN_TYPED_DATA || method === SIGN_TYPED_DATA_V4) {
        const message = payload.params?.[1];
        let parsedData = message;
        if (typeof message === "string") {
          parsedData = JSON.parse(message);
        }
        let version = "V1";
        if (
          typeof parsedData === "object" &&
          (parsedData.types || parsedData.primaryType || parsedData.domain)
        ) {
          version = "V4";
        }
        const result = signTypedData({
          data: parsedData,
          privateKey: toBuffer(wallet.privateKey),
          version: version,
        });

        await wallectConnectConnector.approveRequest({
          id: payload.id,
          result,
        });
        setPendingTransaction(undefined);
      } else {
        console.log("Unsupported Method");
      }
    } catch (err) {
      console.log("confirmTransaction error", err);
      const message = extractJSONRPCMessage(err.error.message);
      displayErrorMessage(message);
      wallectConnectConnector.rejectRequest({
        error: { message: `${method} failed` },
        id: payload.id,
      });
      setPendingTransaction(undefined);
    }
  };

  const cancelTransaction = () => {
    const payload = pendingTransaction;
    wallectConnectConnector.rejectRequest({
      id: payload.id,
      error: { message: "Transaction rejected by user" },
    });
    setPendingTransaction(undefined);
  };

  const displayErrorMessage = useCallback((msg) => {
    setErrorMessage(msg);
    console.log(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  }, []);

  const getHistoricalData = async () => {
    if (isChainIdHistoryBlocked(targetNetwork.chainId)) {
      // return fetch(
      //   `https://api.zksync.io/api/v0.2/accounts/${address}/transactions?from=latest&limit=20&direction=older`
      // )
      //   .then((response) => response.json())
      //   .then((data) => data.result.list.map(txn => ({
      //     data:[],
      //     hash:txn.txHash,
      //     nonce:txn.op.nonce,
      //     from:txn.op.from,
      //     to:txn.op.to,
      //     timestamp:txn.createdAt,
      //     type:0,
      //     value:{
      //       _hex: 0
      //     }
      //   })))
      const myPromise = new Promise((resolve, reject) => {
        resolve([]);
      });
      return myPromise;
    }

    const currentBlock = await localProvider.getBlockNumber();
    const blockTime = 15; // ETH block time is 15 seconds
    const block10Days = currentBlock - (10 * 60 * 60 * 60) / blockTime;
    let networkEtherScan = ethers.providers.getNetwork(targetNetwork.chainId);
    let etherScanProvider = new ethers.providers.EtherscanProvider(
      networkEtherScan,
      ETHERSCAN_KEY
    );

    return await etherScanProvider
      .getHistory(address, block10Days, currentBlock)
      .then((result) => result.reverse());
  };

  // On App Load useEffect, check async storage for an existing wallet, else generate a 🔥 burner wallet.
  useEffect(() => {
    console.log("useEffect App");
    const loadAccountAndNetwork = async () => {
      let activeWallet = await loadWallet();
      if (!activeWallet) {
        setLoadingStatus("generating");
        activeWallet = await generateWallet();
      }
      setLoadingStatus(null);
      setWallet(activeWallet);
      setAddress(activeWallet.address);
  
      const cachedNetwork = await AsyncStorage.getItem("network");
      if (cachedNetwork) setSelectedNetwork(cachedNetwork);
    };
    loadAccountAndNetwork();
  }, []);

  // Auto connect Wallet Connect if url matches WC format
  useEffect(() => {
    const url = walletConnectUrl;
    if (
      url &&
      url.indexOf("wc:") === 0 &&
      url.indexOf("bridge=") !== -1 &&
      url.indexOf("&key=") !== -1
    ) {
      connect(url);
    }
  }, [walletConnectUrl]);

  useEffect(() => {
    if (!address || isFetchingHistoryData) {
      return;
    }
    isFetchingHistoryData = true;
    setTransactionHistory([]);
    getHistoricalData().then((result) => {
      setTransactionHistory(result);
      isFetchingHistoryData = false;
    });
    
    return () => {
      isFetchingHistoryData = false;
    };
  }, [address, targetNetwork]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => {};
  }, [address, targetNetwork]);

  useEffect(() => {
    if (!address || isFetchingHistoryData) {
      return;
    }
    isFetchingHistoryData = true;
    getHistoricalData().then((result) => {
      setTransactionHistory(result);
    });
    lookupAddress(address).then((ensResult)=>{
      setEnsName(ensResult);
    })
    setTimeout(() => {
      getHistoricalData().then((result) => {
        setTransactionHistory(result);
        isFetchingHistoryData = false;
      });
    }, 10000);
    return () => {
      isFetchingHistoryData = false;
    };
  }, [yourLocalBalance]);

  const openBlockExplorer = (entity, element) =>
    Linking.openURL(`${targetNetwork.blockExplorer}${entity}/${element}`);

  const nativeTokenName = targetNetwork.nativeCurrency
    ? targetNetwork.nativeCurrency.name
    : "Ether";
  const nativeTokenSymbol = targetNetwork.nativeCurrency
    ? targetNetwork.nativeCurrency.symbol
    : "ETH";
  const nativeTokenLogo = targetNetwork.nativeCurrency
    ? targetNetwork.nativeCurrency.logoURI
    : "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png";

  if (
    loadingStatus === "started" ||
    !address ||
    loadingStatus === "generating"
  ) {
    return (
      <View style={{ height: "100%", width: "100%" }}>
        <LinearGradient
          colors={["#4580eb", "#249ff5", "#05bcff"]}
          style={styles.linearGradient}
        >
          <View style={styles.mainButtons}>
            <View style={styles.icons}>
              <AntIcon name="wallet" size={40} color="#fff" />
            </View>
            <Text style={styles.buttonText}>
              {loadingStatus === "started" ? "Loading..." : "Generating..."}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  return (
    <>
      <NavigationContainer>
        <ErrorDisplay message={errorMessage} />
        <AppStack.Navigator>
          <AppStack.Group>
            <AppStack.Screen
              name="Home"
              options={({ navigation, route }) => ({
                headerShown: !showTransactionScreen,
                headerLeft: (props) => (
                  <Image style={styles.logo} source={ScaffoldEthWalletLogo} />
                ),
                headerTitle: "Scaffold Wallet",
                // Add a placeholder button without the `onPress` to avoid flicker
                headerRight: (props) => (
                  <Image
                    style={styles.logo}
                    source={NETWORK_IMAGES[selectedNetwork]}
                  />
                ),
              })}
            >
              {({ navigation }) => (
                <HomeScreen
                  updateStorageTransaction={updateStorageTransaction}
                  address={address}
                  isLoading={isLoading}
                  ensName={ensName}
                  navigation={navigation}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={(newValue) =>
                    setSelectedNetwork(newValue)
                  }
                  tokenBalance={yourLocalBalance}
                  tokenName={nativeTokenName}
                  tokenSymbol={nativeTokenSymbol}
                  transactionHistory={
                    !isChainIdHistoryBlocked(targetNetwork.chainId)
                      ? transactionHistory
                      : []
                  }
                  isChainIdBlocked={isChainIdHistoryBlocked(
                    targetNetwork.chainId
                  )}
                  tokenLogo={nativeTokenLogo}
                  isFetchingHistoryData={isFetchingHistoryData}
                  tokenPrice={price}
                  openBlockExplorer={openBlockExplorer}
                  disconnect={disconnect}
                  wallectConnectConnector={wallectConnectConnector}
                  wallet={wallet}
                  pendingTransaction={pendingTransaction}
                  provider={localProvider}
                  gasPrice={gasPrice}
                  showTransactionScreen={showTransactionScreen}
                  walletConnectParams={walletConnectParams}
                  network={walletConnectNetwork}
                  hideTransaction={hideTransaction}
                  confirmTransaction={confirmTransaction}
                  cancelTransaction={cancelTransaction}
                />
              )}
            </AppStack.Screen>
            <AppStack.Screen name="Wallets">
              {({ navigation }) => (
                <WalletsScreen
                  navigation={navigation}
                  wallet={wallet}
                  address={address}
                  setWallet={(newWallet) => setWallet(newWallet)}
                  setAddress={(newAddress) => setAddress(newAddress)}
                />
              )}
            </AppStack.Screen>
          </AppStack.Group>
          <AppStack.Group screenOptions={{ presentation: "modal" }}>
            <AppStack.Screen
              name="QrScanner"
              options={({ navigation, route }) => ({
                headerShown: false,
              })}
            >
              {({ navigation, route }) => (
                <QRScannerScreen
                  route={route}
                  setWalletConnectUrl={setWalletConnectUrl}
                  setToAddress={modifyToAddress}
                  navigation={navigation}
                />
              )}
            </AppStack.Screen>

            <AppStack.Screen
              name="QrShow"
              options={({ navigation, route }) => ({
                headerShown: false,
              })}
            >
              {({ navigation }) => (
                <QRScreen address={address} navigation={navigation} />
              )}
            </AppStack.Screen>
            <AppStack.Screen
              name="Send"
              options={({ navigation, route }) => ({
                headerRight: (props) => (
                  <View style={styles.networkSendContainer}>
                  <Text style={styles.networkSendText}>{selectedNetwork}</Text>
                  <Image
                    style={styles.logo}
                    source={NETWORK_IMAGES[selectedNetwork]}
                  />
                </View>
                ),
              })}
            >
              {({ navigation }) => (
                <SendScreen
                  tokenSymbol={nativeTokenSymbol}
                  balance={yourLocalBalance}
                  price={price}
                  gasPrice={gasPrice}
                  tokenName={nativeTokenName}
                  tokenLogo={nativeTokenLogo}
                  toAddress={toAddress}
                  setToAddress={modifyToAddress}
                  ensNameToAddress={ensNameToAddress}
                  sendEth={sendEth}
                  navigation={navigation}
                />
              )}
            </AppStack.Screen>
            <AppStack.Screen
              name="WalletConnect"
              options={({ navigation, route }) => ({
                headerShown: false,
              })}
            >
              {({ navigation }) => (
                <WalletConnectScreen
                  walletConnectUrl={walletConnectUrl}
                  setWalletConnectUrl={setWalletConnectUrl}
                  navigation={navigation}
                />
              )}
            </AppStack.Screen>
          </AppStack.Group>
        </AppStack.Navigator>
      </NavigationContainer>
    </>
  );
}

var styles = StyleSheet.create({
  logo: { width: 30, height: 30, borderRadius: 50, marginRight: 6 },
  linearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  icons: {
    position: "relative",
  },
  buttonPlus: {
    position: "absolute",
    top: -6,
    right: -10,
  },
  networkSendContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontWeight: "600",
    fontSize: 30,
  },
  networkSendText: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
  buttonText: {
    marginTop: 2,
    fontWeight: "600",
    fontSize: 30,
    textAlign: "center",
    color: "#fff",
  },
  mainButtons: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
