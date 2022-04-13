

import { useState, useEffect } from "react";
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ethers } from "ethers";
import { truncateAddress } from "../helpers/utils";
import { PERSONAL_SIGN, SEND_TRANSACTION, SIGN, SIGN_TRANSACTION } from "../constants";

const TransactionScreen = (props) => {
    const { address, balance, price, gasPrice, pendingTransaction, walletConnectParams, network } = props

    const WCUrl = walletConnectParams.peerMeta.url.replace('https://', '').replace('http://', '')
    const WCIcon = walletConnectParams.peerMeta.icons[0]

    const [loading, setLoading] = useState(false);

    const params = pendingTransaction ? pendingTransaction.params[0] : null
    if (!params) return <></>

    const method = pendingTransaction.method
    const isTransaction = (method === SEND_TRANSACTION || method === SIGN_TRANSACTION)

    let amount = 0
    if (params.value) amount = parseInt(params.value)

    const formattedEthBalance = Math.round(ethers.utils.formatEther(balance) * 1e4) / 1e4
    const contractAddress = params.to ? truncateAddress(params.to) : ''
    const gas = params.gas ? new ethers.BigNumber.from(params.gas).toNumber() : 0
    const transferCostInETH = Number(ethers.utils.formatEther(gasPrice * gas))
    const transferCostInUSD = (transferCostInETH * price).toFixed(2)
    let insufficientFunds = false
    if (isTransaction && amount && gasPrice && balance) {
        insufficientFunds = (Number(amount) + transferCostInETH) > formattedEthBalance
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
    }
    const reject = async () => {
        setLoading(true)
        await props.cancelTransaction()
    }


    return <View
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#fff", flexDirection: 'column', paddingHorizontal: 20 }}>

        <Text style={{
            marginTop: 40,
            marginHorizontal: 32,
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
        }}>
            {isTransaction ? 'Transaction Request' : 'Message Signing Request'}
        </Text>

        {/* WC URL and Details */}
        <View style={{ marginTop: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Image style={{ width: 30, height: 30, marginRight: 8 }} source={{ uri: WCIcon }} />
            <Text style={{ fontSize: 18, fontWeight: '500' }}>{WCUrl}</Text>
        </View>

        {/* Current Wallet and Balance */}
        <View style={{ width: '100%', marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>Wallet</Text>
                <Text style={{ marginTop: 4, fontSize: 18, }}>{displayWalletAddress}</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>Balance</Text>
                <Text style={{ marginTop: 4, fontSize: 18, }}>{formattedEthBalance.toFixed(2)} ETH</Text>
            </View>
        </View>

        {/* Display different details for transaction vs signing requests */}
        {isTransaction ?
            <>
                {/* Transaction Data */}
                <View style={{ width: '100%', marginTop: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '500' }}>Data</Text>
                    <Text style={{ marginTop: 8, fontSize: 14 }}>{data}</Text>
                </View>

                {/* Contract Address and the current Network */}
                <View style={{ marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Contract Address</Text>
                        <Text style={{ marginTop: 4, fontSize: 18 }}>{contractAddress}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Network</Text>
                        <Text style={{ marginTop: 4, fontSize: 18 }}>{network.name} </Text>
                    </View>
                </View>

                {/* Transaction Value and Estimated Gas */}
                <Text style={{ marginTop: 20, fontSize: 40, fontWeight: '500', textAlign: 'center' }}>{amount} ETH</Text>
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 22 }}>~{(amount * price).toFixed(2)} USD</Text>
                    <Text style={{ fontSize: 16 }}>Est. Fee ${transferCostInUSD}</Text>
                </View>
            </> :
            <>
                {/* Message Signing Data */}
                <View style={{ width: '100%', marginTop: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '500' }}>Message</Text>
                    <Text style={{ marginTop: 8, fontSize: 14 }}>{plainTextMessage != null ? plainTextMessage : messageForSigning}</Text>
                </View>
            </>}

        <View style={{ marginTop: 48, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
            <TouchableOpacity style={{ backgroundColor: '#0084ff', paddingVertical: 16, borderRadius: 32, width: '100%' }}
                disabled={insufficientFunds}
                onPress={confirm}>
                <Text style={{ fontSize: 21, fontWeight: '500', color: '#fff', textAlign: 'center' }}>
                    {insufficientFunds ? 'Insufficient funds' : 'Confirm'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 16, width: '100%', marginTop: 8 }}
                onPress={reject}>
                <Text style={{ fontSize: 21, fontWeight: '500', color: '#0084ff', textAlign: 'center' }}>
                    Reject
                </Text>
            </TouchableOpacity>
        </View>

    </View>

}

export default TransactionScreen