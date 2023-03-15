import { View, Text, StyleSheet, Image } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import AntIcon from "react-native-vector-icons/AntDesign";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NETWORK_IMAGES } from "../constants";


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
        useNativeAndroidPickerStyle={false}
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
            width:"100%",
            marginRight:25
          },
          inputAndroid: {
            marginTop: 2,
            fontSize: 20,
            fontWeight: "600",
            width:"100%",
            marginRight:25
          },
        }}
        placeholder={{}}
        Icon={() => <AntIcon style={styles.chev} name="down" size={16} />}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  networkSelectorContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
  },
  networkSelector: {
    fontSize: 22,
    fontWeight: "600",
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
chev:{
  marginTop:8,
  paddingRight:5
}
});
