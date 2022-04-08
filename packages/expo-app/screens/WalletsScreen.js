

import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ethers } from "ethers";
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';


const WalletsScreen = (props) => {
    const { setWallet, setAddress } = props

    const [wallets, setWallets] = useState([]);
    const [privateKeyList, setPrivateKeyList] = useState([]);
    const [reveal, setReveal] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (key) => {
        setCopied(true)
        Clipboard.setString(key);

        setTimeout(() => setCopied(false), 1000)
    };

    useEffect(() => {
        const loadAllAccounts = async () => {
            // FIXME: REFACTOR TO USE SECURE STORAGE
            const pks = JSON.parse(await AsyncStorage.getItem('privateKeyList'))
            setPrivateKeyList(pks)
            const walletList = pks.map(pk => new ethers.Wallet(pk))
            setWallets(walletList)
        }
        loadAllAccounts()
    }, []);

    const generateNewWallet = async () => {
        const generatedWallet = ethers.Wallet.createRandom();
        const newPrivateKey = generatedWallet._signingKey().privateKey;
        await AsyncStorage.setItem('activePrivateKey', newPrivateKey)
        setWallet(generatedWallet)
        setAddress(generatedWallet.address)

        // Add new pk to the existing list
        const pks = JSON.parse(await AsyncStorage.getItem('privateKeyList'))
        pks.push(newPrivateKey)
        await AsyncStorage.setItem('privateKeyList', JSON.stringify(pks))
        setPrivateKeyList(pks)
        const walletList = pks.map(pk => new ethers.Wallet(pk))
        setWallets(walletList)
    }

    const switchToWallet = async (index) => {
        console.log(index, privateKeyList);
        const pk = privateKeyList[index];

        await AsyncStorage.setItem('activePrivateKey', pk)
        const existingWallet = new ethers.Wallet(pk);
        setWallet(existingWallet)
        setAddress(existingWallet.address)
    }

    const deleteWallet = async (index) => {
        const pks = privateKeyList.filter(item => item !== privateKeyList[index])
        await AsyncStorage.setItem('privateKeyList', JSON.stringify(pks))
        setPrivateKeyList(pks)
        const walletList = pks.map(pk => new ethers.Wallet(pk))
        setWallets(walletList)

        await AsyncStorage.setItem('activePrivateKey', pks[0])
        const existingWallet = new ethers.Wallet(pks[0]);
        setWallet(existingWallet)
        setAddress(existingWallet.address)
    }

    return <View
        onPress={props.hide}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#fff", flexDirection: 'column' }}>
        <View style={{ display: 'flex', height: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Text style={{
                marginVertical: 32,
                marginHorizontal: 32,
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
            }}>
                Wallets
            </Text>

            <View style={{ width: '80%', marginHorizontal: 32 }}>
                {wallets.map((wl, index) => {
                    let displayAddress = `${wl.address.slice(0, 6)}...${wl.address.slice(-4)}`;
                    return <View style={{ marginVertical: 16 }} key={index}>
                        {wl.address === props.address ?
                            <View>
                                <Text style={{ fontSize: 24, fontWeight: '500' }}>{displayAddress} (Active)</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {<Button title={reveal ? "Hide Private Key" : "Reveal Private Key"} color="#c92a2a" onPress={() => setReveal(!reveal)} />}
                                    <Button title="Delete" color="#c92a2a" onPress={() => deleteWallet(index)} />
                                </View>
                                {reveal && <View>
                                    <Text style={{ margin: 8, fontSize: 24, backgroundColor: '#ddd', padding: 12 }}>{privateKeyList[index]}</Text>
                                    <TouchableOpacity
                                        onPress={() => copyToClipboard(privateKeyList[index])}>
                                        <Text
                                            style={{ marginTop: 8, fontSize: 20, textAlign: 'center' }}>
                                            <FontAwesomeIcon name="copy" size={18} />
                                            {copied ? ' Copied' : ' Copy'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>}
                            </View> :
                            <TouchableOpacity onPress={() => switchToWallet(index)}>
                                <Text style={{ fontSize: 24, fontWeight: '500' }}>{displayAddress}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                })}
            </View>

            <View style={{ marginTop: 48 }}>

                <Button
                    onPress={generateNewWallet}
                    title="Generate New Wallet" />
                <Button
                    onPress={props.hide}
                    disabled={true}
                    title="Import Private Key" />
                <Button
                    onPress={props.hide}
                    title="Close" />
            </View>
        </View>

    </View>
}

export default WalletsScreen