import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Button,
  Image,
  TextInput,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCodeScanner from "react-native-qrcode-scanner";
import { ethers } from "ethers";
import AntIcon from "react-native-vector-icons/AntDesign";
const WalletConnectIcon = require("../assets/walletConnectWhite.png");
export const WalletConnectScreen = ({
  navigation,
  setWalletConnectUrl,
  walletConnectUrl,
}) => {
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <LinearGradient
        colors={["#05bcff", "#249ff5", "#4580eb"]}
        style={styles.linearGradient}
      >
        <Image style={styles.logo} source={WalletConnectIcon} />
        <TextInput
          placeholder="Wallet Connect Url"
          style={styles.addressInput}
          onChangeText={setWalletConnectUrl}
          value={walletConnectUrl}
          // editable={false}
        />
        <Text style={styles.copyText}>OR</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() =>
            navigation.navigate("QrScanner", {
              target:"walletConnect"
            })
          }
        >
          <AntIcon name="scan1" size={34} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

var styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  addressInput: {
    borderBottomWidth: 0,
    fontSize: 18,
    paddingLeft: 14,
    marginLeft: 10,
    marginTop: 4,
    backgroundColor: "white",
    width: "90%",
    height: 50,
    borderRadius: 20,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 40,
  },
  buttonIcon: {
    marginLeft: -4,
    color: "#fff",
  },
  scanButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: 24,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logo: { height: 80, width: 130, marginTop: 50 },
  copyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
});
