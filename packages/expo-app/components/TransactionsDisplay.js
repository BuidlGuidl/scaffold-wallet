import { usePoller } from 'eth-hooks';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View , StyleSheet} from 'react-native';
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

    return <View style={styles.container}>
           <Text style={styles.title}>Transactions</Text>
        {unconfirmedTransactions.map((txn, i) => {
            const maxFeePerGasInGwei = Number(ethers.utils.formatUnits(txn.maxFeePerGas, 'gwei')).toFixed(1)

            return <View style={styles.row} key={i}>
            <View style={styles.left}>
              <View>
                <Text style={styles.nonce}>#{txn.nonce} <Text style={styles.status}>Pending...</Text></Text>
                <Text style={styles.maxfeed}>
                maxFeePerGas: <Text style={styles.gwei}>{maxFeePerGasInGwei} Gwei</Text>
                </Text>
              </View>
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


const styles = StyleSheet.create({
    container: {
      display: "flex",
      marginTop: 24,
      width: "90%",
      flexDirection: "column",
      justifyContent: "space-between",
      fontSize: 24,
      backgroundColor:"#fff",
      paddingLeft:16,
      paddingRight:16,
      paddingTop:16,
      paddingBottom:16,
      shadowColor: '#171717',
      shadowOffset: {width: -2, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 3,
      borderRadius:10
    },  
    title:{
      fontSize: 22,
      fontWeight: "600",
      color:"#a8a7b9"
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
    nonce: { fontSize: 18, fontWeight:"800", color: "#888" },
    maxfeed: { fontSize: 14, fontWeight:"400", color: "#888" },
    gwei:{
        fontSize: 14, fontWeight:"400",
    },
    status: { fontSize: 14, fontWeight:"500", fontStyle:"italic" },
    dollarSymbol:{
      fontWeight:"300"
    }
  });