

import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { generateNewPrivateKeyAndWallet, loadAllWalletAddresses, switchActiveWallet, truncateAddress, updateWalletAddresses } from "../helpers/utils";
import Blockie from "../components/Blockie";

const WalletsScreen = (props) => {
    const { setWallet, setAddress } = props

    const [walletAddresses, setWalletAddresses] = useState([]);
    const [reveal, setReveal] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (key) => {
        setCopied(true)
        Clipboard.setString(key);

        setTimeout(() => setCopied(false), 1000)
    };

    useEffect(() => {
        const loadAllAccounts = async () => {
            const walletList = await loadAllWalletAddresses()
            setWalletAddresses(walletList)
        }
        loadAllAccounts()
    }, []);

    const generateNewWallet = async () => {
        const { generatedWallet, walletAddresses: walletList } = await generateNewPrivateKeyAndWallet()
        setWallet(generatedWallet)
        setAddress(generatedWallet.address)
        setWalletAddresses(walletList)
    }

    const switchToWallet = async (index) => {
        console.log('switch', index, walletAddresses, walletAddresses[index]);
        const existingWallet = await switchActiveWallet(walletAddresses[index])
        setWallet(existingWallet)
        setAddress(existingWallet.address)
    }

    const deleteWallet = async (index) => {
        if (walletAddresses.length < 2) return

        const walletList = walletAddresses.filter(item => item !== walletAddresses[index])
        await updateWalletAddresses(walletList)
        setWalletAddresses(walletList)

        const existingWallet = await switchActiveWallet(walletAddresses[0])
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
                {walletAddresses.map((walletAddress, index) => {
                    let displayAddress = truncateAddress(walletAddress);
                    return <View style={{ marginVertical: 16 }} key={index}>
                        {walletAddress === props.address ?
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Blockie address={walletAddress} size={36} />
                                    <Text style={{ fontSize: 24, fontWeight: '500', marginLeft: 12 }}>{displayAddress} (Active)</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {<Button title={reveal ? "Hide Private Key" : "Reveal Private Key"} color="#c92a2a" onPress={() => setReveal(!reveal)} />}
                                    <Button title="Delete" color="#c92a2a" disabled={walletAddresses.length < 2} onPress={() => deleteWallet(index)} />
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
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'flex-end' }} onPress={() => switchToWallet(index)}>
                                <Blockie address={walletAddress} size={36} />
                                <Text style={{ fontSize: 24, fontWeight: '500', marginLeft: 12 }}>{displayAddress}</Text>
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