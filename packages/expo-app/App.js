import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, Button, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking, Image, StatusBar } from "react-native";
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import { NETWORKS, ALCHEMY_KEY, SEND_TRANSACTION, PERSONAL_SIGN, SIGN_TRANSACTION, SIGN, DROPDOWN_NETWORK_OPTIONS, SIGN_TYPED_DATA_V4, SIGN_TYPED_DATA } from "./constants";
// Polyfill for localStorage
import "./helpers/windows";
import { ethers } from "ethers";
import { arrayify } from '@ethersproject/bytes';
import { useStaticJsonRPC } from "./hooks";
import useGasPrice from "./hooks/GasPrice";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from "react-native-picker-select";
import AntIcon from 'react-native-vector-icons/AntDesign';
import RNRestart from 'react-native-restart';
import { signTypedData } from '@metamask/eth-sig-util';
import { toBuffer } from 'ethereumjs-util';

// Screens and Components
import QRScannerScreen from "./screens/QRScannerScreen";
import QRDisplayScreen from "./screens/QRScreen";
import WalletsScreen from "./screens/WalletsScreen";
import SendScreen from "./screens/SendScreen";
import TokenDisplay from "./components/TokenDisplay";
import AddressDisplay from "./components/AddressDisplay";
import { loadOrGenerateWallet } from "./helpers/utils";
import TransactionScreen from "./screens/TransactionScreen";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { FloatingButton } from "./components/FloatingButton";
import { TransactionsDisplay } from "./components/TransactionsDisplay";
import { updateStorageTransaction } from "./helpers/Transactions";
import useExchangePrice from "./hooks/ExchangePrice";
import useBalance from "./hooks/Balance";

const initialNetwork = NETWORKS.ethereum; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export default function App() {
  StatusBar.setBarStyle('dark-content', false);

  const [address, setAddress] = useState();
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
  // const showTransaction = useCallback(() => setShowTransactionScreen(true), [])
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

    try {
      // const testGasPrice = new ethers.BigNumber.from('4000000000') //4gwei
      const txConfig = {
        gasPrice: gasPrice,
        // gasLimit: 21000, // Gas limit breaks send on Arbitrum for some reason
        to: to,
        value: ethers.utils.parseEther(ethAmount),
      }
      console.log(txConfig);
      const txn = await signer.sendTransaction(txConfig);
      await updateStorageTransaction(txn)
      console.log('Send successful!');
    } catch (err) {
      console.log('error', err);
    }

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
    try {
      // ============= Handle Sending / Signing a transaction ============= 
      if (method === SEND_TRANSACTION || method === SIGN_TRANSACTION) {
        const signer = wallet.connect(localProvider);
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
          const updatedTxn = await signer.sendTransaction(tx)
          await updateStorageTransaction(updatedTxn)
          hash = updatedTxn.hash
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
      }
      // ============= Handle Personal Sign and Sign ============= 
      else if (method === PERSONAL_SIGN || method === SIGN) {
        const message = method === PERSONAL_SIGN ? payload.params?.[0] : payload.params?.[1]
        const result = await wallet.signMessage(arrayify(message));
        console.log(result);
        await wallectConnectConnector.approveRequest({ id: payload.id, result });
        setPendingTransaction(undefined)
      }
      // ============= Handle TypedData Signing =============
      // Adapted from Rainbow's Signing Code 
      // https://github.com/rainbow-me/rainbow/blob/develop/src/model/wallet.ts#L386
      else if (method === SIGN_TYPED_DATA || method === SIGN_TYPED_DATA_V4) {
        const message = payload.params?.[1]
        let parsedData = message;
        if (typeof message === 'string') {
          parsedData = JSON.parse(message);
        }
        let version = 'V1';
        if (typeof parsedData === 'object' && (parsedData.types || parsedData.primaryType || parsedData.domain)) {
          version = 'V4';
        }
        const result = signTypedData({
          data: parsedData,
          privateKey: toBuffer(wallet.privateKey),
          version: version,
        })

        await wallectConnectConnector.approveRequest({ id: payload.id, result });
        setPendingTransaction(undefined)
      } else {
        console.log('Unsupported Method');
      }
    } catch (err) {
      console.log('error', err);
      wallectConnectConnector.rejectRequest({
        error: { message: `${method} failed` },
        id: payload.id,
      });
      setPendingTransaction(undefined)
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

      const cachedNetwork = await AsyncStorage.getItem('network')
      if (cachedNetwork) setSelectedNetwork(cachedNetwork)
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

  const gasPriceInGwei = gasPrice ? parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei')).toFixed(1) : 0
  const WCIcon = walletConnectParams ? walletConnectParams.peerMeta.icons[0] : null
  const WCUrl = walletConnectParams ? walletConnectParams.peerMeta.url.replace('https://', '').replace('http://', '') : ''

  const openBlockExplorer = () => Linking.openURL(`${targetNetwork.blockExplorer}address/${address}`)

  const nativeTokenName = targetNetwork.nativeCurrency ? targetNetwork.nativeCurrency.name : 'Ether'
  const nativeTokenSymbol = targetNetwork.nativeCurrency ? targetNetwork.nativeCurrency.symbol : 'ETH'
  const nativeTokenLogo = targetNetwork.nativeCurrency ? targetNetwork.nativeCurrency.logoURI : 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'

  const dropdownArrowIcon = () => <FontAwesomeIcon name="chevron-down" size={16} />

  return (
    <View>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openBlockExplorer}>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Explorer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refreshApp}>
            <FontAwesomeIcon name="refresh" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <AddressDisplay address={address} showQR={showQR} showWallet={showWallet} />
          <TokenDisplay tokenBalance={yourLocalBalance} tokenName={nativeTokenName} tokenSymbol={nativeTokenSymbol} tokenLogo={nativeTokenLogo} tokenPrice={price} />

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <TextInput
              placeholder="Wallet Connect Url"
              style={{ width: '100%', marginTop: 16, paddingHorizontal: 4, borderWidth: 1, height: 40, fontSize: 18 }}
              onChangeText={setWalletConnectUrl}
              value={walletConnectUrl}
            // editable={false} 
            />

            <View style={{ width: '100%', marginTop: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {wallectConnectConnector &&
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {WCIcon && <Image style={{ width: 36, height: 36, marginRight: 4 }} source={{ uri: WCIcon }} />}
                    <Text style={[styles.textButton, { color: 'green' }]}>{WCUrl}</Text>
                  </View>
                  <TouchableOpacity onPress={disconnect}>
                    <Text style={[styles.textButton, { marginTop: 12, color: 'red' }]}><FontAwesomeIcon name="close" size={18} />{' '}Disconnect</Text>
                  </TouchableOpacity>
                </>
                // :
                // <TouchableOpacity onPress={() => connect(walletConnectUrl)}>
                //   <Text style={styles.textButton}><FontAwesomeIcon name="plug" size={18} />{' '}Connect</Text>
                // </TouchableOpacity>
              }
            </View>
          </View>

          <TransactionsDisplay provider={localProvider} wallet={wallet} address={address} pendingTransaction={pendingTransaction} />
        </View>

        {/* Bottom Bar */}
        <View style={{ position: 'absolute', bottom: 48, left: 30 }}>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>
              {gasPriceInGwei} Gwei
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RNPickerSelect
                value={selectedNetwork}
                onValueChange={async (value) => {
                  await AsyncStorage.setItem('network', value)
                  setSelectedNetwork(value)
                  // Clear unconfirmed transactions
                  await updateStorageTransaction({})
                }}
                items={DROPDOWN_NETWORK_OPTIONS}
                style={{
                  inputIOS: { fontSize: 32, paddingRight: 22 },
                  iconContainer: { top: 10 },
                }}
                placeholder={{}}
                Icon={dropdownArrowIcon}
              />
            </View>
          </View>
        </View>
        <FloatingButton onPress={showSend} right={120}>
          <FontAwesomeIcon name="send" size={24} color='#fff' />
        </FloatingButton>
        <FloatingButton onPress={showScanner} right={30}>
          <AntIcon name="scan1" size={30} color='#fff' />
        </FloatingButton>
      </SafeAreaView>

      {showSendScreen &&
        <SendScreen address={address}
          tokenSymbol={nativeTokenSymbol}
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
          tokenSymbol={nativeTokenSymbol}
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

      {showWalletScreen && <WalletsScreen address={address} hide={hideWallet} wallet={wallet} setWallet={setWallet} setAddress={setAddress} />}

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
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  main: {
    width: '100%',
    // paddingTop: 16,
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