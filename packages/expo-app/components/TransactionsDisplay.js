import { usePoller } from "eth-hooks";
import { ethers } from "ethers";

import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import {
  getStorageTransactions,
  setStorageTransactions,
  updateStorageTransaction,
} from "../helpers/Transactions";
import { TransactionItem } from "./TransactionItem";

export const TransactionsDisplay = (props) => {
  const {
    provider,
    wallet,
    address,
    isLoading,
    transactionHistory,
    tokenSymbol,
    openBlockExplorer,
  } = props;

  const [unconfirmedTransactions, setUnconfirmedTransactions] = useState([]);

  const updateGasPrice = (gasPrice, speedUpPercentage) => {
    if (!gasPrice) return gasPrice;
    let updatedGasPrice = ethers.BigNumber.from(gasPrice);
    updatedGasPrice = updatedGasPrice.mul(speedUpPercentage + 100).div(100);
    return updatedGasPrice;
  };

  const handleSpeedUp = async (nonce) => {
    const speedUpPercentage = 20;

    const txn = unconfirmedTransactions.find((txn) => txn.nonce === nonce);
    if (!txn) return null;

    let transactionParams = {
      type: txn.type,
      chainId: txn.chainId,
      nonce: txn.nonce,
      maxPriorityFeePerGas: updateGasPrice(
        txn.maxPriorityFeePerGas,
        speedUpPercentage
      ),
      maxFeePerGas: updateGasPrice(txn.maxFeePerGas, speedUpPercentage),
      gasPrice: undefined,
      gasLimit: txn.gasLimit,
      to: txn.to,
      value: txn.value,
      data: txn.data,
    };

    try {
      console.log("========= transactionParams =========", transactionParams);
      // signer sendTransaction
      const signer = wallet.connect(provider);
      const updatedTxn = await signer.sendTransaction(transactionParams);

      await updateStorageTransaction(updatedTxn);

      await pollUnconfirmedTransactions();
    } catch (err) {
      console.log(err);
    }
  };

  const pollUnconfirmedTransactions = async () => {
    // console.log('pollUnconfirmedTransactions', address);

    if (!provider || !address) return;
    // Get current nonce
    const currentNonce = await provider.getTransactionCount(address);
    // console.log('currentNonce', currentNonce);

    let transactions = await getStorageTransactions();
    let transactionArray = [];
    let invalidNonces = [];
    Object.keys(transactions).forEach((key) => {
      if (transactions[key].nonce >= currentNonce) {
        transactionArray.push(transactions[key]);
      } else {
        invalidNonces.push(transactions[key].nonce);
      }
    });
    if (transactionArray.length === 0) {
      setUnconfirmedTransactions([]);
      setStorageTransactions({});
      return;
    }

    console.log("updating pending transactions");

    let updatedTransactions = { ...transactions };
    let txns = await Promise.all(
      transactionArray.map((txn) => provider.getTransaction(txn.hash))
    );

    invalidNonces.forEach((nonce) => {
      delete updatedTransactions[nonce];
    });
    txns.forEach((txn) => {
      // Filter out txns with >= 5 confirmations
      if (txn && txn.confirmations < 5) {
        updatedTransactions[txn.nonce] = txn;
      }
    });

    // Update saved transactions
    setStorageTransactions(updatedTransactions);

    let updatedTransactionArray = [];
    Object.keys(updatedTransactions).forEach((key) => {
      updatedTransactionArray.push(updatedTransactions[key]);
    });

    setUnconfirmedTransactions(updatedTransactionArray);
  };

  usePoller(pollUnconfirmedTransactions, 5000);

  if (!!isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.completedRow}>
          <View
            style={{ backgroundColor: "#ddd", width: 20, height: 20 }}
          ></View>
          <View style={styles.column}>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
          </View>
        </View>
        <View style={styles.completedRow}>
          <View
            style={{ backgroundColor: "#ddd", width: 20, height: 20 }}
          ></View>
          <View style={styles.column}>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
            <View
              style={{
                backgroundColor: "#ddd",
                marginLeft: 10,
                marginBottom: 4,
                width: "90%",
                height: 10,
              }}
            ></View>
          </View>
        </View>
      </View>
    );
  }

  if (unconfirmedTransactions.length == 0 && transactionHistory.length == 0) {
    return <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Text style={[styles.maxfeed, {marginTop:10, marginLeft: 5}]}>No Transactions Yet</Text>
    </View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      {unconfirmedTransactions.map((txn, i) => {
        const maxFeePerGasInGwei = Number(
          ethers.utils.formatUnits(txn.maxFeePerGas, "gwei")
        ).toFixed(1);
        const formattedTokenBalance =
          Math.round(ethers.utils.formatEther(txn.value._hex) * 1e4) / 1e4;
        const transactionDate = new Date();
        return (
          <TransactionItem
            key={txn.hash}
            targetAddress={txn.to}
            isSender={true}
            openBlockExplorer={openBlockExplorer}
            txn={txn}
            handleSpeedUp={handleSpeedUp}
            value={formattedTokenBalance}
            maxFees={maxFeePerGasInGwei}
            date={transactionDate}
            tokenSymbol={tokenSymbol}
          />
        );
      })}

      {transactionHistory
        .filter((item) => item.type == 0)
        .map((txn, i) => {
          const formattedTokenBalance =
            Math.round(ethers.utils.formatEther(txn.value._hex) * 1e4) / 1e4;
          const isSender = address == txn.from;
          const targetAddress = isSender ? txn.to : txn.from;
          const transactionDate = new Date(txn.timestamp * 1000);

          return (
            <TransactionItem
              targetAddress={targetAddress}
              key={txn.hash}
              openBlockExplorer={openBlockExplorer}
              txn={txn}
              isSender={isSender}
              value={formattedTokenBalance}
              date={transactionDate}
              tokenSymbol={tokenSymbol}
            />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    marginTop: 24,
    width: "90%",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 24,
    backgroundColor: "#fff",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderRadius: 10,
  },
  transactionIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 20,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: 24,
    marginTop: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#a8a7b9",
  },
  row: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
    marginTop: 20,
  },
  completedRow: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
    marginTop: 20,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: 24,
    marginTop: 20,
    flex: 1,
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  completedTransaction: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nonce: { fontSize: 18, fontWeight: "800", color: "#888" },
  senderText: { fontSize: 14, fontWeight: "600", color: "#000" },
  maxfeed: { fontSize: 14, fontWeight: "400", color: "#888" },
  value: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
  gwei: {
    fontSize: 14,
    fontWeight: "400",
  },
  status: { fontSize: 14, fontWeight: "500", fontStyle: "italic" },
  dollarSymbol: {
    fontWeight: "300",
  },
});
