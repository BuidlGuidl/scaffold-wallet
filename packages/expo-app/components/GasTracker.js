import React from 'react';
import { Text } from 'react-native';

export const GasTracker = React.memo((props) => {
    return <Text style={{ position: 'absolute', bottom: 32, fontSize: 18, fontWeight: '600' }}>
        {props.gasPriceInGwei} Gwei
    </Text>
})