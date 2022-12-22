import { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import Clipboard from "@react-native-clipboard/clipboard";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

import Blockie from "../components/Blockie";
let whiteLogo = require("../assets/white.png");
export const QRScreen = ({ address, navigation }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    Clipboard.setString(address);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.wholeContainer}
    >
      <LinearGradient
        colors={["#05bcff", "#249ff5", "#4580eb"]}
        style={styles.linearGradient}
      >
        <View style={styles.mainContainer}>
          <QRCode
            size={300}
            quietZone={10}
            logoSize={78}
            logo={whiteLogo}
            logoBackgroundColor="white"
            logoBorderRadius={4}
            value={address}
          />
          <View style={{ position: "absolute" }}>
            <Blockie address={address} size={64} />
          </View>
        </View>

        <View style={styles.addressTextContainer}>
          <TouchableOpacity onPress={copyToClipboard}>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.copyText}>
              {copied ? (
                <FontAwesomeIcon name="check" size={20} color="white" />
              ) : (
                <FontAwesomeIcon name="copy" size={20} color="white" />
              )}{" "}
              Copy Address
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

var styles = StyleSheet.create({
  wholeContainer: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
  },
  linearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  mainContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  addressTextContainer: {
    marginVertical: 32,
    marginHorizontal: 32,
  },
  addressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  copyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
});
