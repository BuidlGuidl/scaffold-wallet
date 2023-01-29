import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const FloatingButton = (props) => {
    return <TouchableOpacity
        activeOpacity={0.7}
        onPress={props.onPress}
        style={{
            position: 'absolute',
            backgroundColor: '#0E76FD',
            width: 75,
            height: 75,
            alignItems: 'center',
            justifyContent: 'center',
            right: props.right,
            bottom: 40,
            borderRadius: 100,
            shadowColor: "#171717",
            shadowOffset: { width: -2, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
        }}>
        {props.children}
    </TouchableOpacity>
}