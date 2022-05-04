
import { ethers } from "ethers";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessControlOptions, loadKeychainValue, saveKeychainValue } from './keychain'

export const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
export const extractJSONRPCMessage = (rawString) => {
    const start = rawString.indexOf(`(body="`)
    const end = rawString.indexOf(`}}`)

    if (start > -1 && end > -1) {
        const JSONstring = rawString.slice(start + 7, end + 2).replaceAll('\\', '')
        try {
            const res = JSON.parse(JSONstring)
            return `Error: ${res.error.message}`
        } catch (error) {
            return JSONstring.slice(0, 60)
        }
    } else {
        return rawString.slice(0, 60)
    }
}

export const loadOrGenerateWallet = async () => {
    const accessControlOptions = await getAccessControlOptions();

    // Check for wallet addresses in AsyncStorage
    const walletAddresses = await loadAllWalletAddresses()
    if (walletAddresses.length === 0) {
        const generatedWallet = ethers.Wallet.createRandom();
        const newWalletAddress = generatedWallet.address
        const newPrivateKey = generatedWallet._signingKey().privateKey;

        await AsyncStorage.setItem('publicKeyList', JSON.stringify([newWalletAddress]))

        await saveKeychainValue('activePrivateKey', newPrivateKey, accessControlOptions)
        await saveKeychainValue(newWalletAddress, newPrivateKey, accessControlOptions)

        return generatedWallet
    } else {
        const pk = await loadKeychainValue('activePrivateKey')
        const existingWallet = new ethers.Wallet(pk);
        return existingWallet
    }
}
export const loadAllWalletAddresses = async () => {
    const addresses = JSON.parse(await AsyncStorage.getItem('publicKeyList'))
    return addresses || []
}

export const generateNewPrivateKeyAndWallet = async () => {
    try {
        const accessControlOptions = await getAccessControlOptions();
        const generatedWallet = ethers.Wallet.createRandom();
        const newWalletAddress = generatedWallet.address
        const newPrivateKey = generatedWallet._signingKey().privateKey;
        await saveKeychainValue('activePrivateKey', newPrivateKey, accessControlOptions)

        await saveKeychainValue(newWalletAddress, newPrivateKey, accessControlOptions)

        // Add new wallet address to the existing list
        const walletAddresses = await loadAllWalletAddresses()
        walletAddresses.push(newWalletAddress)
        await AsyncStorage.setItem('publicKeyList', JSON.stringify(walletAddresses))

        return { generatedWallet, walletAddresses }
    } catch (err) {
        console.log(err);
    }
}

export const saveImportedWallet = async (importedWallet) => {
    try {
        const accessControlOptions = await getAccessControlOptions();
        const walletAddress = importedWallet.address
        const privateKey = importedWallet._signingKey().privateKey;

        // Save new key to keychain
        await saveKeychainValue('activePrivateKey', privateKey, accessControlOptions)
        await saveKeychainValue(walletAddress, privateKey, accessControlOptions)

        // Add new wallet address to the existing list
        const walletAddresses = await loadAllWalletAddresses()
        walletAddresses.push(walletAddress)
        await AsyncStorage.setItem('publicKeyList', JSON.stringify(walletAddresses))

        return walletAddresses
    } catch (err) {
        console.log(err);
    }
}

export const switchActiveWallet = async (walletAddress) => {
    const accessControlOptions = await getAccessControlOptions();

    // Get private key from keychain
    const pk = await loadKeychainValue(walletAddress)

    // Save as active private key
    await saveKeychainValue('activePrivateKey', pk, accessControlOptions)
    return new ethers.Wallet(pk);
}

export const updateWalletAddresses = async (walletAddresses) => {
    await AsyncStorage.setItem('publicKeyList', JSON.stringify(walletAddresses))
}

