import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS = "transactionResponses";

// TRANSACTIONS are stored as a JSON stringified object 
// with keys == nonce and the values == full txn data

export const getStorageTransactions = async () => {
    let transactionsString = await AsyncStorage.getItem(TRANSACTIONS)

    if (transactionsString === null) return {}
    return JSON.parse(transactionsString);
}
export const setStorageTransactions = async (transactions) => {
    await AsyncStorage.setItem(TRANSACTIONS, JSON.stringify(transactions))
}

export const getStorageTransactionByNonce = async (nonce) => {
    let transactions = await getStorageTransactions();
    return transactions[nonce]
}

export const updateStorageTransaction = async (txn) => {
    console.log('updateTxn', txn);
    let transactions = await getStorageTransactions();
    transactions[txn.nonce] = txn;

    await setStorageTransactions(transactions)
}



export const getConfirmations = async (provider) => {
    let newTransactionResponse = await provider.getTransaction(transactionResponse.hash);

    if (!newTransactionResponse) {
        return 0;
    }

    return newTransactionResponse.confirmations;
}