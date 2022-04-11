import { ethers } from "ethers";
import { Text, TouchableOpacity, View } from "react-native";
import QRCodeScanner from 'react-native-qrcode-scanner';


const QRScannerScreen = (props) => {
    const onSuccess = e => {
        const data = e.data;
        console.log(data);

        // Handle WC QR
        if (data && data.indexOf("wc:") === 0) {
            props.setWalletConnectUrl(data)
            props.hide()
        }
        // Handle Address QRs
        else if (data && data.indexOf("ethereum:") === 0) {
            const cleanAddress = data.slice(9)
            props.setToAddress(cleanAddress)
            props.hide()
        } else if (data && ethers.utils.isAddress(data)) {
            props.setToAddress(data)
            props.hide()
        }

    }
    return <View
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#333", flexDirection: 'column', justifyContent: 'center' }}>
        <QRCodeScanner
            onRead={onSuccess}
            reactivate={true}
            reactivateTimeout={1000}
            showMarker={true}
            topContent={
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
                    Scans address or WalletConnect QRs
                </Text>
            }
            bottomContent={
                <TouchableOpacity
                    style={{ width: 80, height: 36, justifyContent: 'center', alignItems: 'center' }}
                    onPress={props.hide}
                >
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Close</Text>
                </TouchableOpacity>
            }
        />
    </View>
}

export default QRScannerScreen