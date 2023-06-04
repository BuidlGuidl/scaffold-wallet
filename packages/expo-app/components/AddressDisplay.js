import React from "react";
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import Blockie from "../components/Blockie";
import AntIcon from "react-native-vector-icons/AntDesign";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

import { truncateAddress } from "../helpers/utils";
import LinearGradient from "react-native-linear-gradient";
const WalletConnectIcon = require("../assets/walletConnect.png");

const AddressDisplay = ({
  showQR,
  address,
  ensName,
  showWallet,
  showWalletConnectScreen,
  sendEth,
}) => {
  if (!address) return <></>;
  const displayAddress = truncateAddress(address);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    Clipboard.setString(address);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.blockieRow}>
        <Blockie address={address} size={100} />
        <TouchableOpacity
          onPress={() => showWallet()}
          style={styles.settingsButton}
        >
          <LinearGradient
            colors={["#4580eb", "#249ff5", "#05bcff"]}
            style={styles.linearGradient}
          >
            <AntIcon style={styles.buttonIcon} name="setting" size={30} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.addressRow}>
        <TouchableOpacity onPress={copyToClipboard}>
          <Text style={styles.text}>{ensName ? ensName : displayAddress}</Text>

          {copied ? (
            <FontAwesomeIcon
              style={styles.copyIcon}
              name="check"
              size={20}
              color="#319694"
            />
          ) : (
            <FontAwesomeIcon
              style={styles.copyIcon}
              name="copy"
              size={20}
              color="#4580eb"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => showWalletConnectScreen()}
        >
          <Image style={styles.logo} source={WalletConnectIcon} />

          <Text style={styles.textButton}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => sendEth()}
        >
          <Text style={styles.textButton}>
            <FontAwesomeIcon name="send" size={20} color="#249ff5" />
          </Text>
          <Text style={styles.textButton}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => showQR()}
        >
          <Text style={styles.textButton}>
            <FontAwesomeIcon name="qrcode" size={20} color="#249ff5" />
          </Text>
          <Text style={styles.textButton}>Receive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  linearGradient: {
    borderRadius: 50,
    height: 40,
    width: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    color: "#fff",
  },
  secondaryButton: {
    width: 100,
    display: "flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    padding: 10
  },
  blockieRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    position: "relative",
  },
  copyIcon: {
    position: "absolute",
    top: 25,
    right: -15,
  },
  logo: { height: 20,width:40 },
  addressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
  },
  text: {
    marginRight: 8,
    marginTop: 20,
    fontSize: 28,
    fontWeight: "600",
  },
  section: {
    display:"flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems:"center",
    marginTop: 20,
  },
  textButton: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default React.memo(AddressDisplay);
