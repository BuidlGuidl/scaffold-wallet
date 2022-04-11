
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import { useState } from "react";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { truncateAddress } from "../helpers/utils";

export default function AddressDisplay(props) {

    const { setShowWalletScreen } = props
    const address = props.address || ''

    let displayAddress = truncateAddress(address);

    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        setCopied(true)
        Clipboard.setString(address);

        setTimeout(() => setCopied(false), 1000)
    };
    const fetchCopiedText = async () => {
        const text = await Clipboard.getString();
        console.log(text);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addressRow}
                onPress={() => setShowWalletScreen(true)}>
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
        marginTop: 8
    },
    addressRow: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16
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