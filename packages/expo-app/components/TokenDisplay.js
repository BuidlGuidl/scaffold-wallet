import React from "react";
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback } from "react-native";
import { ethers } from "ethers";

function TokenDisplay(props) {
  const formattedTokenBalance =
    Math.round(ethers.utils.formatEther(props.tokenBalance) * 1e4) / 1e4;
  const formattedDollarBalance = (
    Number(ethers.utils.formatEther(props.tokenBalance)) * props.tokenPrice
  ).toFixed(2);

  const logoURL = props.tokenLogo;

  return (
    <View
      style={[styles.container, !props.hideShadow ? styles.withShadow : ""]}
    >
      {!props.hideShadow && <Text style={styles.title}>Balance</Text>}
      <TouchableWithoutFeedback onPress={() => !props.hideShadow ? props.openBlockExplorer() : null}>
      <View style={styles.row}>
        <View style={styles.left}>
          {!!props.isLoading ? (
            <>
              <View style={[styles.logo, { backgroundColor: "#ddd" }]}></View>
              <View>
                <View
                  style={{
                    backgroundColor: "#ddd",
                    width: 80,
                    height: 20,
                    marginBottom: 5,
                  }}
                ></View>
                <View
                  style={{ backgroundColor: "#ddd", width: 120, height: 20 }}
                ></View>
              </View>
            </>
          ) : (
            <>
              <Image style={styles.logo} source={{ uri: logoURL }} />
              <View>
                <Text style={styles.tokenBalance}>
                  {parseFloat(formattedTokenBalance.toFixed(9))}{" "}
                  {props.tokenSymbol}
                </Text>
                <Text style={styles.tokenName}>
                  {formattedDollarBalance} USD
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
      </TouchableWithoutFeedback>
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
  },
  withShadow: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tokenName: { fontSize: 18, color: "#888" },
  tokenBalance: { fontSize: 20, fontWeight: "700" },
  dollarBalance: { fontSize: 24, fontWeight: "700" },
  dollarSymbol: {
    fontWeight: "300",
  },
});

export default React.memo(TokenDisplay);
