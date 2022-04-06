
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import { useState } from "react";
export default function AddressDisplay(props) {

    const { setShowWalletScreen } = props
    const address = props.address || ''

    let displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

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
            <Button
                onPress={() => setShowWalletScreen(true)}
                title="Manage" />
            <Text style={styles.text}>
                {displayAddress}
            </Text>
            <View style={styles.section}>
                <TouchableOpacity onPress={copyToClipboard}>
                    <Text
                        style={styles.textButton}>
                        {copied ? 'Copied' : 'Copy Address'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.showQR}
                >
                    <Text
                        style={styles.textButton}>
                        View QR
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 12
    },
    text: {
        fontSize: 28,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 16,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginBottom: 24
    },
    textButton: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
});