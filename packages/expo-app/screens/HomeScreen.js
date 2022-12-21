import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FloatingButton } from "../components/FloatingButton";
import AntIcon from "react-native-vector-icons/AntDesign";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import LinearGradient from "react-native-linear-gradient";

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
  SIGN,
  DROPDOWN_NETWORK_OPTIONS,
  SIGN_TYPED_DATA_V4,
  SIGN_TYPED_DATA,
} from "../constants";
// Polyfill for localStorage
import "../helpers/windows";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";
import { useStaticJsonRPC } from "../hooks";
import useGasPrice from "../hooks/GasPrice";
import WalletConnect from "@walletconnect/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from "react-native-picker-select";
import RNRestart from "react-native-restart";
import { signTypedData } from "@metamask/eth-sig-util";
import { toBuffer } from "ethereumjs-util";

// Screens and Components
import { QRScannerScreen } from "./QRScannerScreen";
import { QRScreen } from "./QRScreen";
import WalletsScreen from "./WalletsScreen";
import SendScreen from "./SendScreen";
import TokenDisplay from "../components/TokenDisplay";
import AddressDisplay from "../components/AddressDisplay";
import { extractJSONRPCMessage, loadOrGenerateWallet } from "../helpers/utils";
import TransactionScreen from "./TransactionScreen";
import { TransactionsDisplay } from "../components/TransactionsDisplay";
import { updateStorageTransaction } from "../helpers/Transactions";
import useExchangePrice from "../hooks/ExchangePrice";
import useBalance from "../hooks/Balance";
import ErrorDisplay from "../components/ErrorDisplay";
import { NetworkDisplay } from "../components/NetworkDisplay";
import WalletConnectDisplay from "../components/WalletConnectDisplay";

const initialNetwork = NETWORKS.ethereum; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

export const HomeScreen = ({
  navigation,
  address,
  tokenBalance,
  tokenName,
  tokenSymbol,
  tokenLogo,
  tokenPrice,
  openBlockExplorer,
  wallet,
  gasPrice,
  pendingTransaction,
  provider,
  showTransactionScreen,
  walletConnectNetwork,
  walletConnectParams,
  hideTransaction,
  cancelTransaction,
  confirmTransaction,
  disconnect,
  wallectConnectConnector,
}) => {
  const WCIcon = walletConnectParams
    ? walletConnectParams.peerMeta.icons[0]
    : null;
  const WCUrl = walletConnectParams
    ? walletConnectParams.peerMeta.url
        .replace("https://", "")
        .replace("http://", "")
    : "";

  return (
    <>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <AddressDisplay
          address={address}
          showQR={() => navigation.navigate("QrShow")}
          showWallet={() => navigation.navigate("Wallets")}
          openBlockExplorer={() => openBlockExplorer()}
        />
        {wallectConnectConnector && (
            <WalletConnectDisplay
              wCIcon={WCIcon}
              wCUrl={WCUrl}
              disconnect={disconnect}
            />
        )}
        <TokenDisplay
          tokenBalance={tokenBalance}
          tokenName={tokenName}
          tokenSymbol={tokenSymbol}
          tokenLogo={tokenLogo}
          tokenPrice={tokenPrice}
        />
        <TransactionsDisplay
          provider={provider}
          wallet={wallet}
          address={address}
          pendingTransaction={pendingTransaction}
        />

        <View
          style={{
            width: "100%",
            marginTop: 12,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>

        {showTransactionScreen && (
          <TransactionScreen
            address={address}
            tokenSymbol={tokenSymbol}
            tokenName={tokenName}
            tokenLogo={tokenLogo}
            balance={tokenBalance}
            price={tokenPrice}
            gasPrice={gasPrice}
            pendingTransaction={pendingTransaction}
            walletConnectParams={walletConnectParams}
            network={walletConnectNetwork}
            hideTransaction={hideTransaction}
            confirmTransaction={confirmTransaction}
            cancelTransaction={cancelTransaction}
          />
        )}
      </ScrollView>
      <FloatingButton onPress={() => navigation.navigate("Send")} right={20}>
        <LinearGradient
          colors={["#4580eb", "#249ff5", "#05bcff"]}
          style={styles.linearGradient}
        >
          <FontAwesomeIcon name="send" size={24} style={styles.buttonIcon} />
        </LinearGradient>
      </FloatingButton>
    </>
  );
};

var styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  buttonIcon: {
    marginLeft: -4,
    color: "#fff",
  },
});
