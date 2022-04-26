import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { ethers } from "ethers";

function TokenDisplay(props) {
    const formattedTokenBalance = Math.round(ethers.utils.formatEther(props.tokenBalance) * 1e4) / 1e4
    const formattedDollarBalance = (Number(ethers.utils.formatEther(props.tokenBalance)) * props.tokenPrice).toFixed(2)

    const logoURL = props.tokenLogo

    return (
        <View style={styles.row}>
            <View style={styles.left}>
                <Image
                    style={styles.logo}
                    source={{ uri: logoURL }}
                />
                <View>
                    <Text style={styles.tokenName}>{props.tokenName}</Text>
                    <Text style={styles.tokenBalance}>{formattedTokenBalance} {props.tokenSymbol}</Text>
                </View>
            </View>

            <Text style={styles.dollarBalance}>${formattedDollarBalance}</Text>
        </View>

    )
}

const styles = StyleSheet.create({
    row: {
        display: 'flex',
        marginTop: 24,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 24
    },
    left: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10
    },
    tokenName: { fontSize: 18, color: '#888' },
    tokenBalance: { fontSize: 20 },
    dollarBalance: { fontSize: 24 }
});

export default React.memo(TokenDisplay)