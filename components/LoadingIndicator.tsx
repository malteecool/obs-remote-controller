import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export function LoadingIndicator(props: { text: string }) {
    const { text } = props;
    return (
        <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
            <StatusBar
                    backgroundColor="transparent"
                    //barStyle="dark-content"
                    translucent={true}
                >
                </StatusBar>
            <ActivityIndicator size={50} />
            <Text style={{ color: 'black' }}>{text}</Text>
        </View>
    )
}