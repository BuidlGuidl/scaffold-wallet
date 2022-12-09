import { Text, TouchableOpacity,StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import QRCodeScanner from "react-native-qrcode-scanner";

export const QRScannerScreen = ({ navigation }) => {
  const onSuccess = (e) => {};
  return (
    <View
        style={{ height: '100%', width: '100%',flexDirection: 'column', justifyContent: 'center' }}>
    <LinearGradient
          colors={["#05bcff", "#249ff5","#4580eb" ]}
          style={styles.linearGradient}
        >
    <QRCodeScanner
      onRead={onSuccess}
      reactivate={true}
      reactivateTimeout={1000}
      showMarker={true}
      markerStyle={{borderColor:"#05bcff"}}
      topContent={
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
          Scans address or WalletConnect QRs
        </Text>
      }
      bottomContent={
        <TouchableOpacity
          style={{
            width: 80,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
            Close
          </Text>
        </TouchableOpacity>
      }
    />
    </LinearGradient>
    </View>
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
      color:"#fff"
    },
    logo:{ width: 30, height: 30, borderRadius: 50 }
  });
  