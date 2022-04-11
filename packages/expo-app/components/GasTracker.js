import React from 'react';
import { Text } from 'react-native';

export const GasTracker = React.memo((props) => {
    return <Text style={{ position: 'absolute', bottom: 16, fontSize: 16, fontWeight: '500' }}>
        {props.gasPriceInGwei} Gwei
    </Text>
})