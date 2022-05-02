

import { useState, useEffect, useRef } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { generateNewPrivateKeyAndWallet, loadAllWalletAddresses, saveImportedWallet, switchActiveWallet, truncateAddress, updateWalletAddresses } from "../helpers/utils";
import Blockie from "../components/Blockie";
import { ethers } from "ethers";

const WalletsScreen = (props) => {
    const { wallet, setWallet, setAddress } = props

    const [loading, setLoading] = useState(false);
    const [walletAddresses, setWalletAddresses] = useState([]);
    const [reveal, setReveal] = useState(false);
    const [copied, setCopied] = useState(false);

    const [showImport, setShowImport] = useState(false);
    const toggleShowImport = () => setShowImport(!showImport)
    const [pkToImport, setPkToImport] = useState('');
    const pkInput = useRef();

    const copyToClipboard = (key) => {
        setCopied(true)
        Clipboard.setString(key);

        setTimeout(() => setCopied(false), 1000)
    };

    const pasteToPkInput = async () => {
        const pk = await Clipboard.getString()
        setPkToImport(pk)
    }

    useEffect(() => {
        if (pkInput && pkInput.current) pkInput.current.focus()
    }, [showImport])

    useEffect(() => {
        const loadAllAccounts = async () => {
            const walletList = await loadAllWalletAddresses()
            setWalletAddresses(walletList)
        }
        loadAllAccounts()
    }, []);

    const generateNewWallet = async () => {
        setLoading(true)
        const { generatedWallet, walletAddresses: walletList } = await generateNewPrivateKeyAndWallet()
        setWallet(generatedWallet)
        setAddress(generatedWallet.address)
        setWalletAddresses(walletList)
        setLoading(false)
    }

    const importWallet = async () => {
        const validPk = pkToImport.length === 66
        if (!validPk) return

        try {
            const importedWallet = new ethers.Wallet(pkToImport)
            const walletList = await saveImportedWallet(importedWallet)
            setWallet(importedWallet)
            setAddress(importedWallet.address)
            setWalletAddresses(walletList)
            setPkToImport('')
            toggleShowImport()
        } catch (err) {
            console.log(err);
        }
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

        const existingWallet = await switchActiveWallet(walletList[0])
        setWallet(existingWallet)
        setAddress(existingWallet.address)
    }

    const toggleReveal = () => setReveal(!reveal)

    return <View
        onPress={props.hide}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#fff", flexDirection: 'column' }}>

        {showImport === false ?
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
                        return <View style={{ marginVertical: 18 }} key={index}>
                            {walletAddress === props.address ?
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <Blockie address={walletAddress} size={36} />
                                        <Text style={{ fontSize: 24, fontWeight: '500', marginLeft: 12 }}>{displayAddress} (Active)</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        {<Button title={reveal ? "Hide Private Key" : "Reveal Private Key"} color="#c92a2a" onPress={toggleReveal} />}
                                        <Button title="Delete" color="#c92a2a" disabled={walletAddresses.length < 2} onPress={() => deleteWallet(index)} />
                                    </View>
                                    {reveal && <View>
                                        <Text style={{ margin: 8, fontSize: 24, backgroundColor: '#ddd', padding: 12 }}>{wallet.privateKey}</Text>
                                        <TouchableOpacity
                                            onPress={() => copyToClipboard(wallet.privateKey)}>
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

                <View style={{ marginTop: 12, flexDirection: 'column' }}>
                    <Button
                        onPress={generateNewWallet}
                        title={loading ? "Generating..." : "Generate New Wallet"}
                        disabled={loading}
                    />

                    <View style={{ marginTop: 4 }}>
                        <Button
                            onPress={toggleShowImport}
                            title="Import Private Key" />
                    </View>
                    <View style={{ marginTop: 4 }}>
                        <Button
                            onPress={props.hide}
                            title="Close" />
                    </View>
                </View>
            </View>
            :
            <View style={{ display: 'flex', height: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{
                    marginVertical: 32,
                    marginHorizontal: 32,
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                }}>
                    Import Wallet
                </Text>
                <TextInput
                    placeholder="private key"
                    ref={pkInput}
                    style={{
                        height: 36,
                        width: '80%',
                        textAlign: 'center',
                        // borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                        fontSize: 18,
                    }}
                    onChangeText={setPkToImport}
                    value={pkToImport}
                />
                <View style={{ marginTop: 12 }}>

                    {pkToImport.length === 0 ?
                        <Button
                            title="Paste"
                            onPress={pasteToPkInput}
                        />
                        :
                        <Button
                            onPress={importWallet}
                            title="Import" />
                    }
                    <View style={{ marginTop: 4 }}>
                        <Button
                            onPress={toggleShowImport}
                            title="Cancel" />
                    </View>
                </View>
            </View>
        }

    </View>
}

export default WalletsScreen