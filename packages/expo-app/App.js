import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import "react-native-get-random-values";
// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
// Polyfill for localStorage
import "./helpers/windows";
import { useBalance } from "eth-hooks/useBalance";
import { useGasPrice } from "eth-hooks/useGasPrice";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useUserProviderAndSigner } from "eth-hooks/useUserProviderAndSigner";
// import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from "react-native-picker-select";
import { ethers } from "ethers";
import AddressDisplay from "./components/AddressDisplay";
import TokenDisplay from "./components/TokenDisplay";
import QRCode from 'react-native-qrcode-svg';

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const DEBUG = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature

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

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([targetNetwork.rpcUrl]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");

  // On App load, check async storage for an existing wallet, else generate a 🔥 burner wallet.

  const [wallet, setWallet] = useState();
  useEffect(() => {
    console.log('useEffect App');
    const loadAccountAndNetwork = async () => {
      // FIXME: REFACTOR TO USE SECURE STORAGE
      const pk = await AsyncStorage.getItem('metaPrivateKey')
      if (!pk) {
        const generatedWallet = ethers.Wallet.createRandom();
        const privateKey = generatedWallet._signingKey().privateKey;
        await AsyncStorage.setItem('metaPrivateKey', privateKey)
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

  // You can warn the user if you would like them to be on a specific network
  const localChainId =
    localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    wallet &&
    wallet.provider &&
    wallet.provider._network &&
    wallet.provider._network.chainId;

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const [showQRScreen, setShowQRScreen] = useState(false);

  const [pendingTransaction, setPendingTransaction] = useState();
  const [walletConnectUrl, setWalletConnectUrl] = useState()
  const [wallectConnectConnector, setWallectConnectConnector] = useState()

  const connect = () => {
    console.log('connect', walletConnectUrl);
    if (walletConnectUrl) {
      const connector = new WalletConnect(
        {
          // Required
          uri: walletConnectUrl,
          // Required
          clientMeta: {
            description: "WalletConnect Developer App",
            url: "https://walletconnect.org",
            icons: ["https://walletconnect.org/walletconnect-logo.png"],
            name: "WalletConnect",
          },
        }
      );

      setWallectConnectConnector(connector)

      // Subscribe to session requests
      connector.on("session_request", (error, payload) => {
        if (error) throw error
        console.log("session_request", payload);

        connector.approveSession({
          accounts: [address],     // required
          chainId: targetNetwork.chainId               // required
        })
      });

      // Subscribe to call requests
      connector.on("call_request", async (error, payload) => {
        if (error) throw error
        console.log("call_request", payload);

        if (payload.method === "eth_sendTransaction") {
          setPendingTransaction(payload)
        }
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
    console.log('to', targetNetwork.rpcUrl);
    if (payload.method === "eth_sendTransaction") {
      const signer = wallet.connect(localProvider);
      try {
        const { to, from, data, value } = payload.params[0]
        const tx = {
          from,
          to,
          gasPrice: ethers.utils.parseUnits("20", "gwei"),
          value,
          data
        }

        const result = await signer.sendTransaction(tx)
        console.log('txn successful');
        // const result = await signer.provider.send(payload.method, payload.params)
        console.log('hash', result.hash);

        wallectConnectConnector.approveRequest({
          id: payload.id,
          result: result.hash,
        });
        console.log('walletconnector request approved');
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
  }
  const cancelTransaction = () => {
    setPendingTransaction(undefined)
  }

  const HomeScreen = () => {
    return <View style={styles.container}>
      <StatusBar style="auto" />
      <RNPickerSelect
        value={selectedNetwork}
        onValueChange={async (value) => {
          await AsyncStorage.setItem('network', value)
          setSelectedNetwork(value)
        }}
        items={options}
        style={pickerSelectStyles}

      />
      <AddressDisplay address={address} showQR={() => setShowQRScreen(true)} />
      <TokenDisplay tokenBalance={yourLocalBalance} tokenName={'Ether'} tokenSymbol={'ETH'} tokenPrice={price} />
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: 80, height: 36, justifyContent: 'center' }}
        // onPress={sendTxn}
        >
          <Text
            style={styles.textButton}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Wallet Connect Url"
        style={{
          marginTop: 24,
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
        <View style={{ borderTopWidth: 1, borderColor: "#aaa", marginTop: 16, paddingTop: 8 }}>
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
  }

  const QRScreen = (props) => {
    return <TouchableOpacity
      onPress={props.hide}
      style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#333", flexDirection: 'column', justifyContent: 'center' }}>
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

        <QRCode
          size={280}
          quietZone={5}
          value={props.address}
        />
      </View>
      <Text style={{
        marginVertical: 32,
        marginHorizontal: 32,
        color: '#fff',
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
      }}>
        {props.address}
      </Text>
    </TouchableOpacity>
  }

  return (
    <View>
      <HomeScreen />
      {showQRScreen && <QRScreen address={address} hide={() => setShowQRScreen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    height: '100%'
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
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    marginHorizontal: '20%',
    width: '60%',
    height: 36,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 32,
    color: 'black',
    // backgroundColor: '#eee'
  },
  iconContainer: {
    top: 46,
    right: 100,
  },
  chevronDown: {
    color: '#fff'
  }
});