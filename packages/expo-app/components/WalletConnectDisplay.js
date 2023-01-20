import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { ethers } from "ethers";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

function WalletConnectDisplay(props) {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Dapp Connected</Text>
      <View style={styles.row}>
        <View style={styles.left}>
          <Image style={styles.logo} source={{ uri: props.wCIcon }}/>
          <View>
            <Text style={styles.tokenName}>{props.wCUrl}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={props.disconnect} style={styles.disconnect}>
          <FontAwesomeIcon  name="power-off" size={20} color={"red"} />
        </TouchableOpacity> 
      </View>
  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    width: "90%",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 24,
    backgroundColor: "#fff",
    borderRadius: 10,
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
  title: {
    fontSize: 18,
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
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  disconnect: { padding:10},
});

export default React.memo(WalletConnectDisplay);
