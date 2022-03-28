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
  const [userSigner, setUserSigner] = useState();
  useEffect(() => {
    console.log('useEffect App');
    const loadAccountAndNetwork = async () => {
      // FIXME: REFACTOR TO USE SECURE STORAGE
      const pk = await AsyncStorage.getItem('metaPrivateKey')
      let signer;
      if (!pk) {
        const generatedWallet = ethers.Wallet.createRandom();
        const privateKey = generatedWallet._signingKey().privateKey;
        await AsyncStorage.setItem('metaPrivateKey', privateKey)
        signer = generatedWallet.connect(localProvider);
        setUserSigner(generatedWallet);
        setAddress(generatedWallet.address)
      } else {
        const existingWallet = new ethers.Wallet(pk);
        signer = existingWallet.connect(localProvider);
        setUserSigner(existingWallet);
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
    userSigner &&
    userSigner.provider &&
    userSigner.provider._network &&
    userSigner.provider._network.chainId;

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  const [walletConnectUrl, setWalletConnectUrl] = useState()

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

        if (payload.method === "personal_sign") {

          // let result = await userProviderAndSigner.provider.send(payload.method, payload.params)
          // console.log('approved!!');
          // connector.approveRequest({
          //   id: payload.id,
          //   result: result
          // });
        }
      });

      connector.on("disconnect", (error, payload) => {
        if (error) throw error
        console.log("disconnect", payload);
      });
    }

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
      />
      <Button
        onPress={connect}
        title="Wallet Connect" />

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
