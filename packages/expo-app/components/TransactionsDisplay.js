import { useNonce } from 'eth-hooks';
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';
import { Button, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getStorageTransactionByNonce, getStorageTransactions, setStorageTransactions, updateStorageTransaction } from '../helpers/Transactions';

export const TransactionsDisplay = (props) => {
    const { provider, gasPrice, wallet, address } = props

    const nonce = useNonce(provider, address)

    const [unconfirmedTransactions, setUnconfirmedTransactions] = useState([]);


    const updateGasPrice = (gasPrice, speedUpPercentage) => {
        if (!gasPrice) return gasPrice
        let updatedGasPrice = ethers.BigNumber.from(gasPrice);
        updatedGasPrice = updatedGasPrice.mul(speedUpPercentage + 100).div(100);
        return updatedGasPrice.toHexString();
    }

    const handleSpeedUp = async (nonce) => {
        const speedUpPercentage = 20
        // Check if transaction is in pending list in storage
        const txn = await getStorageTransactionByNonce(nonce)
        if (!txn) return

        // Format transaction parameters
        let transactionParams = {};
        ["type", "chainId", "nonce", "maxPriorityFeePerGas", "maxFeePerGas", "gasPrice", "gasLimit", "to", "value", "data"].forEach(param => {
            const value = txn[param]
            console.log('value', value);
            if ((value == 0) || (value && value != null)) {
                if (["maxPriorityFeePerGas", "maxFeePerGas", "gasPrice"].indexOf(param) > -1) {
                    const newValue = ethers.BigNumber.from(value);
                    transactionParams[param] = newValue;
                } else {
                    transactionParams[param] = value;
                }
            }
        })


        // Resubmit all transactions as 1559
        transactionParams.gasPrice = undefined
        transactionParams.maxPriorityFeePerGas = updateGasPrice(transactionParams.maxPriorityFeePerGas, speedUpPercentage);

        // This shouldn't be necessary, but without it polygon fails way too many times with "replacement transaction underpriced"
        transactionParams.maxFeePerGas = updateGasPrice(transactionParams.maxFeePerGas, speedUpPercentage);


        console.log('========= transactionParams =========', transactionParams);
        // signer sendTransaction
        const signer = wallet.connect(provider);
        const updatedTxn = await signer.sendTransaction(transactionParams);

        await updateStorageTransaction(updatedTxn)

        // Hide transactions after speed up, to prevent double sends
        setUnconfirmedTransactions([])
    }

    const pollUnconfirmedTransactions = async () => {
        console.log('pollUnconfirmedTransactions', address);
        if (!provider || !address) return
        // Get current nonce
        const currentNonce = nonce
        console.log('currentNonce', currentNonce);

        let transactions = await getStorageTransactions();
        let transactionArray = []
        let invalidNonces = []
        Object.keys(transactions).forEach(key => {
            if (transactions[key].nonce >= currentNonce) {
                transactionArray.push(transactions[key]);
            } else {
                invalidNonces.push(transactions[key].nonce)
            }
        })
        if (transactionArray.length === 0) {
            setUnconfirmedTransactions([])
            setStorageTransactions({})
            return
        }

        console.log('updating pending transactions');

        let updatedTransactions = { ...transactions }
        let txns = await Promise.all(transactionArray.map(txn => provider.getTransaction(txn.hash)))
        invalidNonces.forEach(nonce => { delete updatedTransactions[nonce] })
        txns.forEach(txn => {
            // Filter out txns with >= 5 confirmations
            if (txn && txn.confirmations < 5) {
                updatedTransactions[txn.nonce] = txn
            }
        })

        // Update saved transactions
        setStorageTransactions(updatedTransactions)

        let updatedTransactionArray = []
        Object.keys(updatedTransactions).forEach(key => {
            updatedTransactionArray.push(updatedTransactions[key]);
        })
        setUnconfirmedTransactions(updatedTransactionArray)
    }
    useEffect(() => {
        pollUnconfirmedTransactions();
    }, [gasPrice]);

    return <View style={{ marginTop: 24 }}>
        {unconfirmedTransactions.map(txn => {
            const maxFeePerGasInGwei = Number(ethers.utils.formatUnits(txn.maxFeePerGas, 'gwei')).toFixed(1)
            return <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <Text style={{ fontSize: 16 }}>Transaction <Text style={{ fontWeight: '600' }}>#{txn.nonce}</Text> Pending</Text>
                    <Text style={{ fontSize: 16 }}>Gas Price: <Text style={{ fontWeight: '600' }}>{maxFeePerGasInGwei} Gwei</Text></Text>
                </View>

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => handleSpeedUp(txn.nonce)}
                >
                    <Text style={[{
                        textAlign: 'right',
                        fontSize: 16,
                        fontWeight: "700",
                        color: '#0E76FD',
                    }]}>Speed Up 20%</Text>
                </TouchableOpacity>
            </View>
        })}
    </View>
}