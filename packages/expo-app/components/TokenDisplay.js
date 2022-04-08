
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { ethers } from "ethers";


export default function TokenDisplay(props) {

    const formattedTokenBalance = Math.round(ethers.utils.formatEther(props.tokenBalance) * 1e4) / 1e4
    const formattedDollarBalance = (Number(ethers.utils.formatEther(props.tokenBalance)) * props.tokenPrice).toFixed(2)
    // TODO: Lookup tokenlist
    const logoURL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'

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
        paddingHorizontal: 20,
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