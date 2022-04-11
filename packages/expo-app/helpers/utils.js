
import { ethers } from "ethers";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const loadOrGenerateWallet = async () => {
    // FIXME: REFACTOR TO USE SECURE STORAGE
    const pk = await AsyncStorage.getItem('activePrivateKey')
    if (!pk) {
        const generatedWallet = ethers.Wallet.createRandom();
        const privateKey = generatedWallet._signingKey().privateKey;
        await AsyncStorage.setItem('activePrivateKey', privateKey)
        await AsyncStorage.setItem('privateKeyList', JSON.stringify([privateKey]))
        return generatedWallet
    } else {
        const existingWallet = new ethers.Wallet(pk);
        return existingWallet
    }
}
export const loadAllPrivateKeys = async () => {
    // FIXME: REFACTOR TO USE SECURE STORAGE
    const pks = JSON.parse(await AsyncStorage.getItem('privateKeyList'))
    return pks
}

export const generateNewPrivateKeyAndWallet = async () => {
    const generatedWallet = ethers.Wallet.createRandom();
    const newPrivateKey = generatedWallet._signingKey().privateKey;
    await AsyncStorage.setItem('activePrivateKey', newPrivateKey)

    // Add new pk to the existing list
    const pks = JSON.parse(await AsyncStorage.getItem('privateKeyList'))
    pks.push(newPrivateKey)
    await AsyncStorage.setItem('privateKeyList', JSON.stringify(pks))

    return { generatedWallet, pks }
}

export const switchActiveWallet = async (pk) => {
    await AsyncStorage.setItem('activePrivateKey', pk)
    return new ethers.Wallet(pk);
}

export const updatePrivateKeys = async (pks) => {
    await AsyncStorage.setItem('privateKeyList', JSON.stringify(pks))
}

