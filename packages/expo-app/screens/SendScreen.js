

import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntIcon from 'react-native-vector-icons/AntDesign';
import Blockie from "../components/Blockie";

const SendScreen = (props) => {

    
    return <View
        onPress={props.hide}
        style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: "#fff", flexDirection: 'column', paddingHorizontal: 20 }}>

        <Text style={{
            marginVertical: 40,
            marginHorizontal: 32,
            fontSize: 20,
            fontWeight: "600",
            textAlign: "center",
        }}>
            Send
        </Text>

    </View>
}

export default SendScreen