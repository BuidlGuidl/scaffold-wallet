import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

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
import { ethers } from "ethers";

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

  const [injectedProvider, setInjectedProvider] = useState();
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

  return (
    <View style={styles.container}>
      <Text style={[styles.text]}>
        Using Burner 🔥 Wallet with Address {address}
      </Text>
      <TextInput
        placeholder="Wallet Connect Url"
        style={{
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


      {pendingTransaction && <View>
        <Text>Send Transaction?</Text>
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

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
});
