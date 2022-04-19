import { usePoller } from 'eth-hooks';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getStorageTransactions, setStorageTransactions, updateStorageTransaction } from '../helpers/Transactions';

export const TransactionsDisplay = (props) => {
    const { provider, wallet, address } = props

    const [unconfirmedTransactions, setUnconfirmedTransactions] = useState([]);

    const updateGasPrice = (gasPrice, speedUpPercentage) => {
        if (!gasPrice) return gasPrice
        let updatedGasPrice = ethers.BigNumber.from(gasPrice);
        updatedGasPrice = updatedGasPrice.mul(speedUpPercentage + 100).div(100);
        return updatedGasPrice
    }

    const handleSpeedUp = async (nonce) => {
        const speedUpPercentage = 20

        const txn = unconfirmedTransactions.find(txn => txn.nonce === nonce)
        if (!txn) return null

        let transactionParams = {
            type: txn.type,
            chainId: txn.chainId,
            nonce: txn.nonce,
            maxPriorityFeePerGas: updateGasPrice(txn.maxPriorityFeePerGas, speedUpPercentage),
            maxFeePerGas: updateGasPrice(txn.maxFeePerGas, speedUpPercentage),
            gasPrice: undefined,
            gasLimit: txn.gasLimit,
            to: txn.to,
            value: txn.value,
            data: txn.data
        }

        try {
            console.log('========= transactionParams =========', transactionParams);
            // signer sendTransaction
            const signer = wallet.connect(provider);
            const updatedTxn = await signer.sendTransaction(transactionParams);

            await updateStorageTransaction(updatedTxn)

            await pollUnconfirmedTransactions()
        } catch (err) {
            console.log(err);
        }
    }

    const pollUnconfirmedTransactions = async () => {
        // console.log('pollUnconfirmedTransactions', address);

        if (!provider || !address) return
        // Get current nonce
        const currentNonce = await provider.getTransactionCount(address)
        // console.log('currentNonce', currentNonce);

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

    usePoller(pollUnconfirmedTransactions, 5000);

    return <View style={{ marginTop: 24 }}>
        {unconfirmedTransactions.map(txn => {
            const maxFeePerGasInGwei = Number(ethers.utils.formatUnits(txn.maxFeePerGas, 'gwei')).toFixed(1)
            return <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }} key={txn.nonce}>
                <View>
                    <Text style={{ fontSize: 16 }}>Transaction <Text style={{ fontWeight: '600' }}>#{txn.nonce}</Text> Pending</Text>
                    <Text style={{ fontSize: 16 }}>maxFeePerGas: <Text style={{ fontWeight: '600' }}>{maxFeePerGasInGwei} Gwei</Text></Text>
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