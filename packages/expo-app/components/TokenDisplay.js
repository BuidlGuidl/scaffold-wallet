import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { ethers } from "ethers";

function TokenDisplay(props) {
  const formattedTokenBalance =
    Math.round(ethers.utils.formatEther(props.tokenBalance) * 1e4) / 1e4;
  const formattedDollarBalance = (
    Number(ethers.utils.formatEther(props.tokenBalance)) * props.tokenPrice
  ).toFixed(2);

  const logoURL = props.tokenLogo;

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Balance</Text>
        <View style={styles.separator}></View>
      <View style={styles.row}>
        <View style={styles.left}>
          <Image style={styles.logo} source={{ uri: logoURL }} />
          <View>
            <Text style={styles.tokenName}>{props.tokenName}</Text>
            <Text style={styles.tokenBalance}>
              {formattedTokenBalance} {props.tokenSymbol}
            </Text>
          </View>
        </View>

        <Text style={styles.dollarBalance}>${formattedDollarBalance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    marginTop: 24,
    width: "90%",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
  },
  separator:{
    height: 1,
    width: "100%",
    backgroundColor: "gray"
  },    
  title:{
    fontSize: 28,
    fontWeight: "600",
  },
  row: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 24,
    marginTop: 20
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tokenName: { fontSize: 18, color: "#888" },
  tokenBalance: { fontSize: 20 },
  dollarBalance: { fontSize: 24 },
});

export default React.memo(TokenDisplay);
