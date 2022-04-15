import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, Button, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image, StatusBar } from "react-native";
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import { NETWORKS, ALCHEMY_KEY, SEND_TRANSACTION, PERSONAL_SIGN, SIGN_TRANSACTION, SIGN, DROPDOWN_NETWORK_OPTIONS } from "./constants";
// Polyfill for localStorage
import "./helpers/windows";
import { ethers } from "ethers";
import { arrayify } from '@ethersproject/bytes';
import { useBalance } from "eth-hooks/useBalance";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useStaticJsonRPC } from "./hooks";
import useGasPrice from "./hooks/GasPrice";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from "react-native-picker-select";
import AntIcon from 'react-native-vector-icons/AntDesign';
import RNRestart from 'react-native-restart';

// Screens and Components
import QRScannerScreen from "./screens/QRScannerScreen";
import QRDisplayScreen from "./screens/QRScreen";
import WalletsScreen from "./screens/WalletsScreen";
import SendScreen from "./screens/SendScreen";
import TokenDisplay from "./components/TokenDisplay";
import AddressDisplay from "./components/AddressDisplay";
import { loadOrGenerateWallet } from "./helpers/utils";
import { GasTracker } from "./components/GasTracker";
import TransactionScreen from "./screens/TransactionScreen";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FloatingButton } from "./components/FloatingButton";

const initialNetwork = NETWORKS.rinkeby; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export default function App() {
  StatusBar.setBarStyle('dark-content', false);

  const networkOptions = [initialNetwork.name, "ethereum", "rinkeby"];

  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);

  const targetNetwork = NETWORKS[selectedNetwork];

  // load all your providers
  const localProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);
  const mainnetProvider = useStaticJsonRPC(providers);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);
  /* 🔥 This hook will get the price of Gas from ⛽️ Etherscan */
  const gasPrice = useGasPrice(targetNetwork, 10000);
  const yourLocalBalance = useBalance(localProvider, address);

  // Different Screens and functions to show/hide
  // Note the useCallback to prevent excessive re-eval/rendering in child components since so much state is in App.js
  const [showQRScanner, setShowQRScanner] = useState(false);
  const showScanner = useCallback(() => setShowQRScanner(true), [])
  const hideScanner = useCallback(() => setShowQRScanner(false), [])

  const [showWalletScreen, setShowWalletScreen] = useState(false);
  const showWallet = useCallback(() => setShowWalletScreen(true), [])
  const hideWallet = useCallback(() => setShowWalletScreen(false), [])

  const [showQRDisplayScreen, setShowQRDisplayScreen] = useState(false);
  const showQR = useCallback(() => setShowQRDisplayScreen(true), [])
  const hideQR = useCallback(() => setShowQRDisplayScreen(false), [])

  const [showSendScreen, setShowSendScreen] = useState(false);
  const showSend = useCallback(() => setShowSendScreen(true), [])
  const hideSend = useCallback(() => setShowSendScreen(false), [])

  const [showTransactionScreen, setShowTransactionScreen] = useState(false);
  const showTransaction = useCallback(() => setShowTransactionScreen(true), [])
  const hideTransaction = useCallback(() => setShowTransactionScreen(false), [])


  const [wallet, setWallet] = useState();
  const [toAddress, setToAddress] = useState();
  const [pendingTransaction, setPendingTransaction] = useState();
  const [walletConnectUrl, setWalletConnectUrl] = useState()
  const [wallectConnectConnector, setWallectConnectConnector] = useState()
  const [walletConnectParams, setWalletConnectParams] = useState();
  const [walletConnectNetwork, setWalletConnectNetwork] = useState();

  const refreshApp = () => RNRestart.Restart()

  const sendEth = async (ethAmount, to) => {
    const signer = wallet.connect(localProvider);
    await signer.sendTransaction({
      to: to,
      gasPrice: gasPrice,
      value: ethers.utils.parseEther(ethAmount),
      data: "0x"
    });
    console.log('Send successful!');
  }

  const connect = (url) => {
    console.log('connect', url);
    if (url) {
      const connector = new WalletConnect(
        {
          uri: url,
          clientMeta: {
            description: "Forkable Mobile Wallet for small/quick transactions.",
            url: "https://punkwallet.io",
            icons: ["https://punkwallet.io/punk.png"],
            name: "🧑‍🎤 PunkWallet.io",
          },
        }
      );

      // Check if connection is already established
      if (!connector.connected) connector.createSession();

      setWallectConnectConnector(connector)

      // Subscribe to session requests
      connector.on("session_request", (error, payload) => {
        console.log("session_request", payload);
        if (error) throw error


        if (payload.params && payload.params.length > 0) {
          setWalletConnectParams(payload.params[0])
          setWalletConnectNetwork(targetNetwork)
        }

        connector.approveSession({
          accounts: [address],
          chainId: targetNetwork.chainId
        })
      });

      // Subscribe to call requests
      connector.on("call_request", async (error, payload) => {
        console.log("call_request", payload);
        if (error) throw error

        setPendingTransaction(payload)
        setShowTransactionScreen(true)
      });

      connector.on("disconnect", async (error, payload) => {
        console.log("disconnect", payload);
        if (error) console.log(error);;

        setWalletConnectUrl(undefined)
        setWallectConnectConnector(undefined)
        setWalletConnectParams(undefined)
        setWallectConnectNetwork(undefined)

        // Force reload the JS bundle to clear WC stuff
        refreshApp();
      });
    }
  }

  const disconnect = async () => {
    try {
      await wallectConnectConnector.killSession()
    } catch (err) {
      console.log('killSession failed', err)

      // Force reload the JS bundle to clear WC stuff
      refreshApp()
    }
  }

  const confirmTransaction = async () => {
    const payload = pendingTransaction
    const method = payload.method
    console.log('confirmTransaction', targetNetwork.rpcUrl, payload);

    // Handle Sending / Signing a transaction
    if (method === SEND_TRANSACTION || method === SIGN_TRANSACTION) {
      const signer = wallet.connect(localProvider);
      try {
        const { to, from, data, value } = payload.params[0]
        const tx = {
          from,
          to,
          gasPrice: gasPrice,
          value,
          data
        }
        console.log('tx', tx);
        let hash
        if (method === SEND_TRANSACTION) {
          hash = (await signer.sendTransaction(tx)).hash
          console.log(hash);
          console.log('Transaction Sent');
        } else {
          hash = await signer.signTransaction(tx)
          console.log('Transaction Signed');
        }

        wallectConnectConnector.approveRequest({
          id: payload.id,
          result: hash,
        });
        console.log('Sent ApproveRequest back to Wallet Connect');
        setPendingTransaction(undefined)
      } catch (error) {
        // console.log(wallet, signer);
        console.log('error', error);
        wallectConnectConnector.rejectRequest({
          error,
          id: payload.id,
        });
      }
    }
    else {
      if (method === PERSONAL_SIGN || method === SIGN) {
        // Personal Sign uses first param signing
        const message = method === PERSONAL_SIGN ? payload.params?.[0] : payload.params?.[1]
        const result = await wallet.signMessage(arrayify(message));
        console.log(result);
        await wallectConnectConnector.approveRequest({ id: payload.id, result });
        setPendingTransaction(undefined)
      } else {
        // TODO SIGN TYPED DATA
        console.log('Unsupported Method');
      }
    }
  }

  const cancelTransaction = () => {
    const payload = pendingTransaction
    wallectConnectConnector.rejectRequest({
      id: payload.id,
      error: { message: "Transaction rejected by user" },
    });
    setPendingTransaction(undefined)
  }

  // On App Load useEffect, check async storage for an existing wallet, else generate a 🔥 burner wallet.
  useEffect(() => {
    console.log('useEffect App');
    const loadAccountAndNetwork = async () => {

      const activeWallet = await loadOrGenerateWallet()
      setWallet(activeWallet)
      setAddress(activeWallet.address)

      // const cachedNetwork = await AsyncStorage.getItem('network')
      // if (cachedNetwork) setSelectedNetwork(cachedNetwork)
    }
    loadAccountAndNetwork()
  }, [])

  // Auto connect Wallet Connect if url matches WC format
  useEffect(() => {
    const url = walletConnectUrl;
    if (url && url.indexOf("wc:") === 0 && url.indexOf("bridge=") !== -1 && url.indexOf("&key=") !== -1) {
      connect(url)
    }
  }, [walletConnectUrl])


  const gasPriceInGwei = gasPrice ? parseInt(ethers.utils.formatUnits(gasPrice, 'gwei')) : 0
  const WCIcon = walletConnectParams ? walletConnectParams.peerMeta.icons[0] : null
  const WCUrl = walletConnectParams ? walletConnectParams.peerMeta.url.replace('https://', '').replace('http://', '') : ''

  return (
    <View>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text></Text>
          {/* <TouchableOpacity onPress={refreshApp}>
            <FontAwesomeIcon name="refresh" size={18} />
          </TouchableOpacity> */}
        </View>
        <View style={styles.main}>
          <AddressDisplay address={address} showQR={showQR} showWallet={showWallet} />
          <TokenDisplay tokenBalance={yourLocalBalance} tokenName={'Ether'} tokenSymbol={'ETH'} tokenPrice={price} />

          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={showSend}>
              <Text style={styles.textButton}><FontAwesomeIcon name="send" size={18} />{' '}Send</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <TextInput
              placeholder="Wallet Connect Url"
              style={{ width: '100%', marginTop: 16, paddingHorizontal: 4, borderWidth: 1, height: 40, fontSize: 18 }}
              onChangeText={setWalletConnectUrl}
              value={walletConnectUrl}
            // editable={false} 
            />

            <View style={{ width: '100%', marginTop: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {wallectConnectConnector ?
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {WCIcon && <Image style={{ width: 36, height: 36, marginRight: 4 }} source={{ uri: WCIcon }} />}
                    <Text style={[styles.textButton, { color: 'green' }]}>{WCUrl}</Text>
                  </View>
                  <TouchableOpacity onPress={disconnect}>
                    <Text style={[styles.textButton, { marginTop: 12, color: 'red' }]}><FontAwesomeIcon name="close" size={18} />{' '}Disconnect</Text>
                  </TouchableOpacity>
                </>
                :
                <TouchableOpacity onPress={() => connect(walletConnectUrl)}>
                  <Text style={styles.textButton}><FontAwesomeIcon name="plug" size={18} />{' '}Connect</Text>
                </TouchableOpacity>
              }
            </View>
          </View>

        </View>
        <FloatingButton onPress={showScanner} right={30}>
          <AntIcon name="scan1" size={30} color='#fff' />
        </FloatingButton>
        <View style={{ position: 'absolute', bottom: 32, left: 30 }}>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 2 }}>
              {gasPriceInGwei} Gwei
            </Text>
            <RNPickerSelect
              value={selectedNetwork}
              onValueChange={async (value) => {
                await AsyncStorage.setItem('network', value)
                setSelectedNetwork(value)
              }}
              items={DROPDOWN_NETWORK_OPTIONS}
              style={{
                inputIOS: { fontSize: 28 }
              }}
            />

          </View>

        </View>

        {/* {(!pendingTransaction && !showQRDisplayScreen) && <GasTracker gasPriceInGwei={gasPriceInGwei} />} */}
      </SafeAreaView>

      {showSendScreen &&
        <SendScreen address={address}
          hide={hideSend}
          balance={yourLocalBalance}
          price={price}
          gasPrice={gasPrice}
          showScanner={showScanner}
          toAddress={toAddress}
          setToAddress={setToAddress}
          sendEth={sendEth} />}

      {showTransactionScreen &&
        <TransactionScreen
          address={address}
          balance={yourLocalBalance}
          price={price}
          gasPrice={gasPrice}
          pendingTransaction={pendingTransaction}
          walletConnectParams={walletConnectParams}
          network={walletConnectNetwork}
          hideTransaction={hideTransaction}
          confirmTransaction={confirmTransaction}
          cancelTransaction={cancelTransaction}
        />}

      {showWalletScreen && <WalletsScreen address={address} hide={hideWallet} setWallet={setWallet} setAddress={setAddress} />}

      {showQRDisplayScreen && <QRDisplayScreen address={address} hide={hideQR} />}

      {showQRScanner && <QRScannerScreen hide={hideScanner} setWalletConnectUrl={setWalletConnectUrl} connect={connect} setToAddress={setToAddress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: "center",
    backgroundColor: "#fff",
    height: '100%'
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  main: {
    width: '100%',
    paddingTop: 16,
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  textButton: {
    color: '#0E76FD',
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});