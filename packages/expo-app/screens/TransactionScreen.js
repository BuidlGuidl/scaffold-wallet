import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView } from "react-native";
import { BigNumber, utils } from "ethers";
import { truncateAddress } from "../helpers/utils";
import { PERSONAL_SIGN, SEND_TRANSACTION, SIGN_TRANSACTION } from "../constants";

const TransactionScreen = (props) => {
    const { address, tokenSymbol, balance, price, gasPrice, pendingTransaction, hideTransaction, walletConnectParams, network } = props

    const WCUrl = walletConnectParams.peerMeta.url.replace('https://', '').replace('http://', '')
    const WCIcon = walletConnectParams.peerMeta.icons[0]

    const [loading, setLoading] = useState(false);

    const params = pendingTransaction ? pendingTransaction.params[0] : null
    if (!params) return <></>

    const method = pendingTransaction.method
    const isTransaction = (method === SEND_TRANSACTION || method === SIGN_TRANSACTION)

    let amount = 0
    if (params.value) amount = Number(utils.formatEther(BigNumber.from(params.value)))

    const formattedEthBalance = Math.round(utils.formatEther(balance) * 1e4) / 1e4
    const contractAddress = params.to ? truncateAddress(params.to) : ''
    const gas = params.gas ? BigNumber.from(params.gas) : BigNumber.from("0x0")

    const transferCostInETH = Number(utils.formatEther(gas.mul(gasPrice)))

    const transferCostInUSD = (transferCostInETH * price).toFixed(2)
    let insufficientFunds = false
    if (isTransaction && gasPrice && balance) {
        insufficientFunds = (amount + transferCostInETH) > formattedEthBalance
    }

    const data = params.data

    let messageForSigning
    let plainTextMessage = null
    if (!isTransaction) {
        messageForSigning = method === PERSONAL_SIGN ? pendingTransaction.params[0] : pendingTransaction.params[1]
        // Generate plain text version of the message if possible
        if (method === PERSONAL_SIGN) {
            console.log('test', messageForSigning);
            const stripped = messageForSigning.substring(2);
            const buff = Buffer.from(stripped, 'hex');
            plainTextMessage = buff.toString('utf8');
        }
    }

    const displayWalletAddress = truncateAddress(address);

    const confirm = async () => {
        setLoading(true)
        await props.confirmTransaction()
        setLoading(false)
        hideTransaction()
    }
    const reject = async () => {
        setLoading(true)
        await props.cancelTransaction()
        setLoading(false)
        hideTransaction()
    }

    return <SafeAreaView style={{ position: 'absolute', height: '100%', width: '100%' }}>
        <ScrollView style={{ backgroundColor: "#fff", flexDirection: 'column', paddingHorizontal: 20 }}>
            <Text style={{
                marginHorizontal: 32,
                fontSize: 20,
                fontWeight: "600",
                textAlign: "center",
            }}>
                {isTransaction ? 'Transaction Request' : 'Message Signing Request'}
            </Text>

            {/* WC URL and Details */}
            <View style={[styles.row, { flexDirection: 'row' }]}>
                <Image style={{ width: 40, height: 40, marginRight: 8 }} source={{ uri: WCIcon }} />
                <Text style={[styles.rowTitle]}>{WCUrl}</Text>
            </View>

            {/* Current Wallet and Balance */}
            <View style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={[styles.rowTitle]}>Wallet</Text>
                    <Text style={[styles.rowData]}>{displayWalletAddress}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={[styles.rowTitle]}>Balance</Text>
                    <Text style={[styles.rowData]}>{formattedEthBalance.toFixed(2)} {tokenSymbol}</Text>
                </View>
            </View>

            {/* Display different details for transaction vs signing requests */}
            {isTransaction ?
                <>
                    {/* Contract Address and the current Network */}
                    <View style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={[styles.rowTitle]}>Contract Address</Text>
                            <Text style={[styles.rowData]}>{contractAddress}</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={[styles.rowTitle]}>Network</Text>
                            <Text style={[styles.rowData]}>{network.name} </Text>
                        </View>
                    </View>

                    {/* Transaction Data */}
                    <View style={[styles.row]}>
                        <Text style={[styles.rowTitle]}>Data</Text>
                        <Text style={[styles.rowData, { marginTop: 8, fontSize: 16, fontStyle: 'italic' }]}>{data}</Text>
                    </View>

                    {/* Transaction Value and Estimated Gas */}
                    <Text style={{ marginTop: 20, fontSize: 44, fontWeight: '500', textAlign: 'center' }}>{amount} {tokenSymbol}</Text>
                    <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[{ fontSize: 24 }]}>~{(amount * price).toFixed(2)} USD</Text>
                        <Text style={[{ fontSize: 20 }]}>Est. Fee ${transferCostInUSD}</Text>
                    </View>
                </> :
                <>
                    {/* Message Signing Data */}
                    <View style={styles.row}>
                        <Text style={[styles.rowTitle]}>Message</Text>
                        <Text style={{ marginTop: 8, fontSize: 18, fontStyle: 'italic' }}>{plainTextMessage != null ? plainTextMessage : messageForSigning}</Text>
                    </View>
                </>}

            <View style={{ marginTop: 48, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <TouchableOpacity style={{ backgroundColor: loading ? 'gray' : '#0084ff', paddingVertical: 16, borderRadius: 32, width: '100%' }}
                    disabled={loading || insufficientFunds}
                    onPress={confirm}>
                    <Text style={{ fontSize: 21, fontWeight: '500', color: '#fff', textAlign: 'center' }}>
                        {insufficientFunds ? 'Insufficient funds' : 'Confirm'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: 16, width: '100%', marginTop: 8 }}
                    onPress={loading || reject}>
                    <Text style={{ fontSize: 21, fontWeight: '500', color: '#0084ff', textAlign: 'center' }}>
                        Reject
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>

}

const styles = StyleSheet.create({
    row: {
        marginTop: 24, width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
    },
    rowTitle: {
        fontSize: 18, fontWeight: '600'
    },
    rowData: {
        marginTop: 6, fontSize: 22,
    }
});

export default TransactionScreen