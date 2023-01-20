import { Text, TouchableOpacity, StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCodeScanner from "react-native-qrcode-scanner";
import { ethers } from "ethers";

export const QRScannerScreen = ({
  navigation,
  setWalletConnectUrl,
  setToAddress,
  route
}) => {
  const {target } = route.params;
  const copy = target === "walletConnect" ? "Scan WalletConnect QRs" : target === "address" ?  "Scan address" :"Scan address or WalletConnect QRs" ;

  const onSuccess = (e) => {
    const data = e.data;
    console.log(data);

    // Handle WC QR
    if (data && data.indexOf("wc:") === 0) {
      setWalletConnectUrl(data);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
    // Handle Address QRs
    else if (data && data.indexOf("ethereum:") === 0) {
      let cleanAddress = data.slice(9);
      if (cleanAddress.indexOf("@") != -1) {
        cleanAddress = cleanAddress.split("@")[0];
      }
      setToAddress(cleanAddress);
      navigation.navigate("Send");
    } else if (data && ethers.utils.isAddress(data)) {
      setToAddress(data);
      navigation.navigate("Send");
    }
  };
  return (
    <TouchableWithoutFeedback
      style={{
        height: "100%",
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
      }}
      onPress={() => navigation.goBack()}
    >
      <LinearGradient
        colors={["#05bcff", "#249ff5", "#4580eb"]}
        style={styles.linearGradient}
      >
        <QRCodeScanner
          onRead={onSuccess}
          reactivate={true}
          reactivateTimeout={1000}
          showMarker={true}
          markerStyle={{ borderColor: "#05bcff" }}
          topContent={
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
            {copy}
            </Text>
          }
          bottomContent={
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
                Close
              </Text>
          }
        />
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

var styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  buttonIcon: {
    marginLeft: -4,
    color: "#fff",
  },
  logo: { width: 30, height: 30, borderRadius: 50 },
});
