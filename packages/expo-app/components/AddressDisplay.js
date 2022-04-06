
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";

export default function AddressDisplay(props) {

    const { setShowWalletScreen } = props
    const address = props.address || ''

    let displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
        <View style={styles.container}>
            <Button
                onPress={() => setShowWalletScreen(true)}
                title="Manage" />
            <Text style={styles.text}>
                {displayAddress}
            </Text>
            <View style={styles.section}>
                <TouchableOpacity>
                    <Text
                        style={styles.textButton}>
                        Copy Address
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                // onPress={fetchCopiedText}
                >
                    <Text
                        style={styles.textButton}
                        onPress={props.showQR}>
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