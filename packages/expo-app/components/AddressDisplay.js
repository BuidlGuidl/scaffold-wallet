import React from "react";
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import Blockie from "../components/Blockie";
import AntIcon from "react-native-vector-icons/AntDesign";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

import { truncateAddress } from "../helpers/utils";
import LinearGradient from "react-native-linear-gradient";

const AddressDisplay = ({ showQR, address, showWallet, openBlockExplorer }) => {
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
          <Text style={styles.text}>{displayAddress}</Text>

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
          onPress={() => showQR()}
        >
          <Text style={styles.textButton}>
            <FontAwesomeIcon name="qrcode" size={18} color="#4580eb" /> View QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => openBlockExplorer()}
        >
          <Text style={styles.textButton}>
            <AntIcon name="search1" size={18} color="#4580eb" /> Explorer
          </Text>
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
    marginTop: 30,
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
    width: "50%",
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
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
  },
  textButton: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default React.memo(AddressDisplay);
