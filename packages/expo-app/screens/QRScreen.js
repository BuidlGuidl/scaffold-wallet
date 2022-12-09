import { Text, TouchableOpacity, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import Blockie from "../components/Blockie";
let whiteLogo = require('../assets/white.png');
export const QRScreen = ({address, navigation}) => {
    return <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#333", flexDirection: 'column', justifyContent: 'center' }}>
    <View style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    }}>
        <QRCode
            size={300}
            quietZone={10}
            logoSize={78}
            logo={whiteLogo}
            logoBackgroundColor='white'
            logoBorderRadius={4}
            value={address}
        />
        <View style={{ position: 'absolute' }}>
            <Blockie address={address} size={64} />
        </View>
    </View>

    <Text style={{
        marginVertical: 32,
        marginHorizontal: 32,
        color: '#fff',
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
    }}>
        {address}
    </Text>
</TouchableOpacity>
}