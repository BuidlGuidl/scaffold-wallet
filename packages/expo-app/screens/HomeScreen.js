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
} from "../constants";
// Polyfill for localStorage
import "../helpers/windows";
import { ethers } from "ethers";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import TokenDisplay from "../components/TokenDisplay";
import AddressDisplay from "../components/AddressDisplay";
import TransactionScreen from "./TransactionScreen";
import { TransactionsDisplay } from "../components/TransactionsDisplay";
import WalletConnectDisplay from "../components/WalletConnectDisplay";

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
  transactionHistory,
  confirmTransaction,
  disconnect,
  network,
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
  const gasPriceInGwei = gasPrice
    ? parseFloat(ethers.utils.formatUnits(gasPrice, "gwei")).toFixed(1)
    : 0;

  const paddingTop =
    !wallectConnectConnector || !!pendingTransaction ? 110 : 40;
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: paddingTop,
        }}
      >
        <View style={{ marginTop: 10, display:"flex", flexDirection:"row", justifyContent:"center", alignItems:"center" }}>
          <FontAwesome5
            name="gas-pump"
            size={16}
            style={styles.buttonIconGwei}
          />
          <Text style={{ fontSize: 14, fontWeight: "700"}}> {gasPriceInGwei} Gwei</Text>
          
        </View>

        <AddressDisplay
          address={address}
          showQR={() => navigation.navigate("QrShow")}
          showWallet={() => navigation.navigate("Wallets")}
          openBlockExplorer={() => openBlockExplorer("address", address)}
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
          tokenSymbol={tokenSymbol}
          transactionHistory={transactionHistory}
          wallet={wallet}
          address={address}
          openBlockExplorer={(txHash) => openBlockExplorer("tx", txHash)}
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
            network={network}
            hideTransaction={hideTransaction}
            confirmTransaction={confirmTransaction}
            cancelTransaction={cancelTransaction}
          />
        )}
      </ScrollView>
      <FloatingButton onPress={() => navigation.navigate("QrScanner")} right={20}>
        <LinearGradient
          colors={["#4580eb", "#249ff5", "#05bcff"]}
          style={styles.linearGradient}
        >
          <AntIcon name="scan1" size={34} style={styles.buttonIcon} />
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
    color: "#fff",
  },
  buttonIconGwei: {},
});
