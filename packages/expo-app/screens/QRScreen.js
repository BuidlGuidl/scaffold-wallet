import { Text, TouchableOpacity, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';

const QRDisplayScreen = (props) => {
    return <TouchableOpacity
        onPress={props.hide}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#333", flexDirection: 'column', justifyContent: 'center' }}>
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            <QRCode
                size={280}
                quietZone={5}
                value={props.address}
            />
        </View>
        <Text style={{
            marginVertical: 32,
            marginHorizontal: 32,
            color: '#fff',
            fontSize: 18,
            fontWeight: "600",
            textAlign: "center",
        }}>
            {props.address}
        </Text>
    </TouchableOpacity>
}

export default QRDisplayScreen