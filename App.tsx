import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, StatusBar, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native';
import { LoadingIndicator } from './components/LoadingIndicator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SceneScreen } from './components/SceneScreen';
import { ConnectScreen } from './components/ConnectScreen';
import EStyleSheet from 'react-native-extended-stylesheet';
import { buildStyles } from './Styles';
import { NewSceneConfigScreen } from './components/NewSceneConfigScreen';

//const obs = new OBSWebSocket();

const Stack = createNativeStackNavigator();

export default function App() {

    buildStyles()

    const config = {
        animation: 'timing',
        config: {
            duration: 1000,
            easing: 1000
        },
    };
    return (
        <View style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0 }}>
            <StatusBar
                backgroundColor='transparent'
                barStyle="dark-content"
                translucent={true}
            >
            </StatusBar>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="connectScreen" component={ConnectScreen} 
                        options={({ route }) => ({
                            headerShown: false,
                            transitionSpec: {
                                open: config,
                                close: config,
                            },
                        })} />
                    <Stack.Screen name="sceneScreen" component={SceneScreen} options={({ route }) => ({
                        headerShown: false,
                        transitionSpec: {
                            open: config,
                            close: config,
                        },
                    })} />
                    <Stack.Screen name='newSceneConfigScreen' component={NewSceneConfigScreen} options={({ route }) => ({
                        headerShown: false,
                        transitionSpec: {
                            open: config,
                            close: config,
                        },
                    })} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>

    );
}
