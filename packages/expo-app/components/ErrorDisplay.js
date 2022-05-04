
import React from 'react';
import { Text, View } from "react-native";

const ErrorDisplay = (props) => {
    if (!props.message) return <></>

    return (
        <View style={{ position: 'absolute', bottom: 120, paddingHorizontal: 20, paddingVertical: 6, backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 14 }}>
                {props.message}
            </Text>
        </View>
    )
}

export default React.memo(ErrorDisplay)