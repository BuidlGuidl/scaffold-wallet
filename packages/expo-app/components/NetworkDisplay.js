import { View, Text, StyleSheet, Image } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import AntIcon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';

const NETWORK_IMAGES = {
  ethereum: require("../assets/eth.png"),
  optimism:require("../assets/op.png"),
  arbitrum: require("../assets/arb.png"),
  gnosis:require("../assets/gnosis.png"),
  polygon:require("../assets/polygon.png"),
  goerli: require("../assets/goerli.png"),
  mumbai: require("../assets/mumbai.png"),
  zksyncTestnet: require("../assets/zksync.png")
}
export const NetworkDisplay = ({
  selectedNetwork,
  setSelectedNetwork,
  updateStorageTransaction,
  networkOptions,
}) => {
  return (
    <View style={styles.networkSelectorContainer}>
      <Image style={styles.logo} source={NETWORK_IMAGES[selectedNetwork]} />

      <RNPickerSelect
        value={selectedNetwork}
        onValueChange={async (value) => {
          await AsyncStorage.setItem("network", value);
          setSelectedNetwork(value);
          // Clear unconfirmed transactions
          await updateStorageTransaction({});
        }}
        items={networkOptions}
        style={{
          inputIOS: {
            marginTop: 2,
            fontSize: 20,
            fontWeight: "600",
          },
        }}
        placeholder={{}}
        Icon={null}
      />
      <AntIcon style={styles.chev} name="down" size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  networkSelectorContainer: {
    display: "flex",
    width: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    backgroundColor: "#FDFAF8",
    height: 36,
    borderRadius: 50,
    borderColor: "#eee",
    borderWidth: 2,
  },
  networkSelector: {
    fontSize: 22,
    fontWeight: "600",
    color: "red",
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  chev: {
    marginLeft:6
  },
});
