import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import { NETWORKS, ALCHEMY_KEY, SEND_TRANSACTION, PERSONAL_SIGN, SIGN_TRANSACTION, SIGN } from "./constants";
// Polyfill for localStorage
import "./helpers/windows";
import { useBalance } from "eth-hooks/useBalance";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
// import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from "react-native-picker-select";
import { ethers } from "ethers";
import { arrayify } from '@ethersproject/bytes';
import AddressDisplay from "./components/AddressDisplay";
import TokenDisplay from "./components/TokenDisplay";
import QRScannerScreen from "./screens/QRScannerScreen";
import QRDisplayScreen from "./screens/QRScreen";
import WalletsScreen from "./screens/WalletsScreen";
import useGasPrice from "./hooks/GasPrice";
import FontAwesomeIcon from 'react-native-vector-icons/AntDesign';
/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const DEBUG = true;

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export default function App() {
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);

  const targetNetwork = NETWORKS[selectedNetwork];

  // load all your providers
  const localProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);
  const mainnetProvider = useStaticJsonRPC(providers);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ Etherscan */
  const gasPrice = useGasPrice(targetNetwork, "fast");

  // On App load, check async storage for an existing wallet, else generate a 🔥 burner wallet.

  const [wallet, setWallet] = useState();
  useEffect(() => {
    console.log('useEffect App');
    const loadAccountAndNetwork = async () => {
      // FIXME: REFACTOR TO USE SECURE STORAGE
      const pk = await AsyncStorage.getItem('activePrivateKey')
      if (!pk) {
        const generatedWallet = ethers.Wallet.createRandom();
        const privateKey = generatedWallet._signingKey().privateKey;
        await AsyncStorage.setItem('activePrivateKey', privateKey)
        await AsyncStorage.setItem('privateKeyList', JSON.stringify([privateKey]))
        setWallet(generatedWallet)
        setAddress(generatedWallet.address)
      } else {
        const existingWallet = new ethers.Wallet(pk);
        setWallet(existingWallet)
        setAddress(existingWallet.address)
      }

      const cachedNetwork = await AsyncStorage.getItem('network')
      if (cachedNetwork) setSelectedNetwork(cachedNetwork)
    }
    loadAccountAndNetwork()
  }, [])

  const options = [];
  for (const id in NETWORKS) {
    options.push(
      { label: NETWORKS[id].name, value: NETWORKS[id].name, color: NETWORKS[id].color }
    );
  }

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Different Screens
  const [showQRDisplayScreen, setShowQRDisplayScreen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showWalletScreen, setShowWalletScreen] = useState(false);

  const [pendingTransaction, setPendingTransaction] = useState();
  const [walletConnectUrl, setWalletConnectUrl] = useState()
  const [wallectConnectConnector, setWallectConnectConnector] = useState()

  const connect = () => {
    console.log('connect', walletConnectUrl);
    if (walletConnectUrl) {
      const connector = new WalletConnect(
        {
          uri: walletConnectUrl,
          clientMeta: {
            description: "Forkable web wallet for small/quick transactions.",
            url: "https://punkwallet.io",
            icons: ["https://punkwallet.io/punk.png"],
            name: "🧑‍🎤 PunkWallet.io",
          },
        }
      );

      setWallectConnectConnector(connector)

      // Subscribe to session requests
      connector.on("session_request", (error, payload) => {
        if (error) throw error
        console.log("session_request", payload);

        connector.approveSession({
          accounts: [address],
          chainId: targetNetwork.chainId
        })
      });

      // Subscribe to call requests
      connector.on("call_request", async (error, payload) => {
        if (error) throw error
        console.log("call_request", payload);

        // if (payload.method === "eth_sendTransaction") {
        setPendingTransaction(payload)
        // }
      });

      connector.on("disconnect", (error, payload) => {
        if (error) throw error
        console.log("disconnect", payload);
      });
    }

  }

  const disconnect = () => {
    setWalletConnectUrl(undefined);
    wallectConnectConnector.killSession()
    setWallectConnectConnector(undefined)
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

        let hash
        if (method === SEND_TRANSACTION) {
          hash = await signer.sendTransaction(tx)
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

  const HomeScreen = () => {
    return <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text></Text>
        <RNPickerSelect
          value={selectedNetwork}
          onValueChange={async (value) => {
            await AsyncStorage.setItem('network', value)
            setSelectedNetwork(value)
          }}
          items={options}
          style={{
            inputIOS: {
              height: 36,
              fontSize: 20,
              fontWeight: '500',
              textAlign: 'center',
              color: 'black',
            }
          }}
        />
        <TouchableOpacity onPress={() => setShowQRScanner(true)}>
          <FontAwesomeIcon name="scan1" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <AddressDisplay address={address} showQR={() => setShowQRDisplayScreen(true)} setShowWalletScreen={setShowWalletScreen} />
        <TokenDisplay tokenBalance={yourLocalBalance} tokenName={'Ether'} tokenSymbol={'ETH'} tokenPrice={price} />
        {/* <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: 80, height: 36, justifyContent: 'center' }}
        // onPress={sendTxn}
        >
          <Text
            style={styles.textButton}>
            Send
          </Text>
        </TouchableOpacity>
      </View> */}
        {!wallectConnectConnector && <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Button
            onPress={() => setShowQRScanner(true)}
            title="Scan QR" />
        </View>}

        <TextInput
          placeholder="Wallet Connect Url"
          style={{
            marginTop: 16,
            borderWidth: 1,
            width: '100%',
            height: 36
          }}
          onChangeText={setWalletConnectUrl}
          value={walletConnectUrl}
          editable={!wallectConnectConnector}
        />



        {wallectConnectConnector ?
          <Button
            onPress={disconnect}
            title="Disconnect" /> :
          <Button
            onPress={connect}
            title="Connect" />}


        {pendingTransaction &&
          <View style={{ borderTopWidth: 1, borderColor: "#aaa", paddingTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", textAlign: 'center' }}>Transaction Request</Text>
            <Text>{JSON.stringify(pendingTransaction.params[0], null, 2)}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Button
                onPress={confirmTransaction}
                title="Confirm" />
              <Button
                onPress={cancelTransaction}
                title="Cancel" />
            </View>
          </View>}

      </View>
      {!pendingTransaction && <Text style={{ position: 'absolute', bottom: 16, fontSize: 14, fontWeight: '500' }}>{typeof gasPrice === "undefined" ? 0 : parseInt(ethers.utils.formatUnits(gasPrice, 'gwei'))} Gwei</Text>}
    </View>
  }

  return (
    <View>
      <HomeScreen />
      {showWalletScreen && <WalletsScreen address={address} hide={() => setShowWalletScreen(false)} setWallet={setWallet} setAddress={setAddress} />}
      {showQRDisplayScreen && <QRDisplayScreen address={address} hide={() => setShowQRDisplayScreen(false)} />}
      {showQRScanner && <QRScannerScreen hide={() => setShowQRScanner(false)} setWalletConnectUrl={setWalletConnectUrl} />}
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
    marginTop: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  main: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  textButton: {
    color: '#0E76FD',
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});