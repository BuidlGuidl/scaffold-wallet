import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const FloatingButton = (props) => {
    return <TouchableOpacity
        activeOpacity={0.7}
        onPress={props.onPress}
        style={{
            position: 'absolute',
            backgroundColor: '#0E76FD',
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            right: props.right,
            bottom: 30,
            borderRadius: 30
        }}>
        {props.children}
    </TouchableOpacity>
}