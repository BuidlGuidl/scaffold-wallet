

import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ethers } from "ethers";
import AntIcon from 'react-native-vector-icons/AntDesign';
import Blockie from "../components/Blockie";

const SendScreen = (props) => {

    const { address, tokenSymbol, balance, price, gasPrice, showScanner, toAddress, setToAddress, sendEth } = props
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(0);

    const formattedEthBalance = Math.round(ethers.utils.formatEther(balance) * 1e4) / 1e4

    const transferCostInETH = Number(ethers.utils.formatEther(gasPrice * 21000))
    const transferCostInUSD = (transferCostInETH * price).toFixed(2)
    let insufficientFunds = false
    if (amount && gasPrice && balance) {
        insufficientFunds = (Number(amount) + transferCostInETH) > formattedEthBalance
    }

    const validToAddress = toAddress ? ethers.utils.isAddress(address) : false
    const validAmount = !isNaN(amount) && amount !== 0

    const send = async () => {
        setLoading(true)
        await sendEth(amount, toAddress)
        setLoading(false)
        props.hide()
    }

    return <View
        onPress={props.hide}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#fff", flexDirection: 'column', paddingHorizontal: 20 }}>

        <Text style={{
            marginVertical: 40,
            marginHorizontal: 32,
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
        }}>
            Send
        </Text>

        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 22, fontWeight: '500' }}>To:</Text>
            {(validToAddress && toAddress.length === 42) && <Blockie address={toAddress} size={24} />}
            <TextInput
                placeholder="address"
                style={{
                    flex: 7,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                    height: 36,
                    fontSize: 18, paddingRight: 28, marginLeft: 4
                }}
                onChangeText={setToAddress}
                value={toAddress}
            />
            <TouchableOpacity onPress={showScanner} style={{ marginLeft: -24 }}>
                <AntIcon name="scan1" size={24} />
            </TouchableOpacity>
        </View>
        <View style={{ width: '100%', marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>Wallet Balance {formattedEthBalance} {tokenSymbol}</Text>
        </View>



        <View style={{ width: '100%', marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
                style={{ flex: 2, fontSize: 50 }}
                value={amount}
                keyboardType='numeric'
                maxLength={8}
                onChangeText={setAmount}
                placeholder="0.0"
            />
            <Text style={{ flex: 1, fontSize: 36, textAlign: 'right', fontWeight: '500' }}>{tokenSymbol}</Text>
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 22 }}>~{(amount * price).toFixed(2)} USD</Text>
            <Text style={{ fontSize: 16 }}>Est. Fee ${transferCostInUSD}</Text>
        </View>

        <View style={{ marginTop: 48, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
            <TouchableOpacity style={{ backgroundColor: (!validToAddress || !validAmount || loading) ? 'gray' : '#0084ff', paddingVertical: 16, borderRadius: 32, width: '100%' }}
                disabled={insufficientFunds || !validToAddress || !validAmount || loading}
                onPress={send}>
                <Text style={{ fontSize: 21, fontWeight: '500', color: '#fff', textAlign: 'center' }}>
                    {insufficientFunds ? 'Insufficient funds' : 'Confirm'}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 16, width: '100%', marginTop: 8 }}
                onPress={props.hide}>
                <Text style={{ fontSize: 21, fontWeight: '500', color: '#0084ff', textAlign: 'center' }}>
                    Cancel
                </Text>
            </TouchableOpacity>
        </View>

    </View>
}

export default SendScreen