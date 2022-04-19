
import React from 'react';
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import Blockie from "../components/Blockie";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { truncateAddress } from "../helpers/utils";
let whiteLogo = require('../assets/white.png');

const AddressDisplay = (props) => {
    console.log('render AddressDisplay');

    if (!props.address) return <></>

    const address = props.address
    let displayAddress = truncateAddress(address);

    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        setCopied(true)
        Clipboard.setString(address);
        setTimeout(() => setCopied(false), 1000)
    };

    return (
        <View style={styles.container}>
            <View style={styles.blockieRow}><Blockie address={address} size={48} /></View>
            {/* <View style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                position: 'relative'
            }}>
                <QRCode
                    size={220}
                    logoSize={66}
                    logo={whiteLogo}
                    logoBackgroundColor='white'
                    logoBorderRadius={4}
                    value={address}
                />
                <View style={{ position: 'absolute' }}>
                    <Blockie address={address} size={56} />
                </View>
            </View> */}

            <TouchableOpacity style={styles.addressRow}
                onPress={props.showWallet}>
                <Text style={styles.text}>
                    {displayAddress}
                </Text>
                <FontAwesomeIcon name="chevron-down" size={20} />
            </TouchableOpacity>

            <View style={styles.section}>
                <TouchableOpacity onPress={copyToClipboard}>
                    <Text
                        style={styles.textButton}>
                        <FontAwesomeIcon name="copy" size={18} />
                        {copied ? ' Copied' : ' Copy Address'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.showQR}
                >
                    <Text
                        style={styles.textButton}>

                        <FontAwesomeIcon name="qrcode" size={18} />
                        {' '}View QR
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12
    },
    blockieRow: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    addressRow: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginTop: 8,
        marginBottom: 12
    },
    text: {
        marginRight: 8,
        fontSize: 28,
        fontWeight: "600",
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginBottom: 12
    },
    textButton: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
});

export default React.memo(AddressDisplay)