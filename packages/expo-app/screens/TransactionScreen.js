import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { BigNumber, utils } from "ethers";
import { truncateAddress } from "../helpers/utils";
import {
  PERSONAL_SIGN,
  SEND_TRANSACTION,
  SIGN_TRANSACTION,
} from "../constants";

const TransactionScreen = (props) => {
  const {
    address,
    tokenSymbol,
    balance,
    price,
    gasPrice,
    pendingTransaction,
    navigation,
    walletConnectParams,
    network,
  } = props;

  const WCUrl = walletConnectParams.peerMeta.url
    .replace("https://", "")
    .replace("http://", "");
  const WCIcon = walletConnectParams.peerMeta.icons[0];

  const [loading, setLoading] = useState(false);

  const params = pendingTransaction ? pendingTransaction.params[0] : null;
  if (!params) return <></>;

  const method = pendingTransaction.method;
  const isTransaction =
    method === SEND_TRANSACTION || method === SIGN_TRANSACTION;

  let amount = 0;
  if (params.value)
    amount = Number(utils.formatEther(BigNumber.from(params.value)));

  const formattedEthBalance =
    Math.round(utils.formatEther(balance) * 1e4) / 1e4;
  const contractAddress = params.to ? truncateAddress(params.to) : "";
  const gas = params.gas ? BigNumber.from(params.gas) : BigNumber.from("0x0");

  const transferCostInETH = Number(utils.formatEther(gas.mul(gasPrice)));

  const transferCostInUSD = (transferCostInETH * price).toFixed(2);
  let insufficientFunds = false;
  if (isTransaction && gasPrice && balance) {
    insufficientFunds = amount + transferCostInETH > formattedEthBalance;
  }

  const data = params.data;

  let messageForSigning;
  let plainTextMessage = null;
  if (!isTransaction) {
    messageForSigning =
      method === PERSONAL_SIGN
        ? pendingTransaction.params[0]
        : pendingTransaction.params[1];
    // Generate plain text version of the message if possible
    if (method === PERSONAL_SIGN) {
      console.log("test", messageForSigning);
      const stripped = messageForSigning.substring(2);
      const buff = Buffer.from(stripped, "hex");
      plainTextMessage = buff.toString("utf8");
    }
  }

  const displayWalletAddress = truncateAddress(address);

  const confirm = async () => {
    setLoading(true);
    await props.confirmTransaction();
    setLoading(false);
    navigation.goBack();
  };
  const reject = async () => {
    setLoading(true);
    await props.cancelTransaction();
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        backgroundColor: "#fff",
        flexDirection: "column",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          marginHorizontal: 32,
          marginBottom: 40,
          fontSize: 20,
          fontWeight: "600",
          textAlign: "center",
          marginTop: 100,
        }}
      >
        {isTransaction ? "Transaction Request" : "Message Signing Request"}
      </Text>
      <Text style={styles.title}>Account</Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
          marginLeft: 5,
        }}
      >
        <Blockie address={address} size={30} />
        <Text style={{ fontWeight: "600", fontSize: 20, marginLeft: 15 }}>
          {displayWalletAddress}
        </Text>
      </View>
      <TokenDisplay
        hideShadow={true}
        tokenBalance={balance}
        tokenName={tokenName}
        tokenSymbol={tokenSymbol}
        tokenLogo={tokenLogo}
        tokenPrice={price}
      />

      {/* WC URL and Details */}
      <View style={styles.separator}></View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.title}>Origin</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 20,
            marginLeft: 5,
          }}
        >
          <Image
            style={{ width: 40, height: 40, marginRight: 8 }}
            source={{ uri: WCIcon }}
          />
          <Text style={[styles.rowTitle]}>{WCUrl}</Text>
        </View>
      </View>
      <View style={styles.separator}></View>
      {/* Display different details for transaction vs signing requests */}
      {isTransaction ? (
        <>
          {/* Contract Address and the current Network */}
          <Text
            style={{
              marginTop: 25,
              fontSize: 44,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {amount} {tokenSymbol}
          </Text>
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={[{ fontSize: 24 }]}>
              ~{(amount * price).toFixed(2)} USD
            </Text>
            <Text style={[{ fontSize: 20 }]}>
              Est. Fee ${transferCostInUSD}
            </Text>
          </View>

          <Text style={[styles.title, { marginTop: 40 }]}>
            Contract Address
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              marginLeft: 5,
            }}
          >
            <Blockie address={contractAddress} size={30} />
            <Text
              style={{
                fontWeight: "600",
                fontSize: 16,
                width: "90%",
                marginLeft: 15,
              }}
            >
              {contractAddress}
            </Text>
          </View>
          <View style={styles.separator}></View>
          <Text style={[styles.title]}>Network</Text>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              width: "90%",
              marginLeft: 5,
              marginTop: 10,
            }}
          >
            {network.name}
          </Text>
          <View style={styles.separator}></View>
          <Text style={[styles.title]}>Data</Text>
          <Text
            style={{
              fontWeight: "400",
              fontSize: 16,
              width: "90%",
              fontStyle: "italic",
              marginLeft: 5,
              marginTop: 10,
            }}
          >
            {data}
          </Text>
        </>
      ) : (
        <>
          {/* Message Signing Data */}
          <Text style={styles.title}>Message</Text>
          <Text style={{ marginTop: 8, fontSize: 18, fontStyle: "italic" }}>
            {plainTextMessage != null ? plainTextMessage : messageForSigning}
          </Text>
        </>
      )}

      <View
        style={{
          marginTop: 48,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: loading ? "gray" : "#0084ff",

            borderRadius: 32,
            width: "100%",
          }}
          disabled={loading || insufficientFunds}
          onPress={confirm}
        >
          <LinearGradient
            colors={
              loading
                ? ["#888", "#888", "#888"]
                : ["#4580eb", "#249ff5", "#05bcff"]
            }
            style={styles.linearGradient}
          >
            <Text
              style={{
                fontSize: 21,
                fontWeight: "500",
                color: "#fff",
                textAlign: "center",
              }}
            >
              {insufficientFunds ? "Insufficient funds" : "Confirm"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingVertical: 16, width: "100%", marginTop: 8 }}
          onPress={loading || reject}
        >
          <Text
            style={{
              fontSize: 21,
              fontWeight: "500",
              color: "#0084ff",
              textAlign: "center",
            }}
          >
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: 24,
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  linearGradient: {
    borderRadius: 50,
    height: 50,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  rowData: {
    marginTop: 6,
    fontSize: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#a8a7b9",
  },
  separator: {
    height: 0.5,
    width: "100%",
    backgroundColor: "#888",
    marginTop: 20,
    marginBottom: 20,
  },
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
});

export default TransactionScreen;
