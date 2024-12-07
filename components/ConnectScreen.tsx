import { MaterialCommunityIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EStyleSheet from "react-native-extended-stylesheet";
import { NavigationProp } from "@react-navigation/native";
import ObsService from "../services/ObsService";

export function ConnectScreen(props: { navigation: NavigationProp<any, any>, route: any }) {

    const { navigation, route } = props;

    const obsService = new ObsService();

    const defaultIP: string = 'ws://192.168.1.165';
    const defaultPort: string = '4455'

    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [storeSession, setStoreSession] = useState<boolean>(true);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [customIp, setCustomIp] = useState<string>(defaultIP);
    const [customPort, setCustomPort] = useState<string>(defaultPort);
    const [loading, setLoading] = useState<boolean>(false);

    const saveSession = async (password: string, customIp: string, customPort: string) => {
        await AsyncStorage.setItem('obsPassword', password);
        await AsyncStorage.setItem('obsIp', customIp);
        await AsyncStorage.setItem('obsPort', customPort);
    }

    const load = async () => {
        try {
            setLoading(true);
            const storedPassword = await AsyncStorage.getItem('obsPassword');

            const storedIp = await AsyncStorage.getItem('obsIp');
            console.log(storedIp)
            const storedPort = await AsyncStorage.getItem('obsPort');
            console.log(storedPassword);
            if (!storedPassword || !storedIp || !storedPort) {
                return;
            }
            setPassword(storedPassword);
            if (obsService.obs && !obsService.obs.identified) {
                const errorMessage: string = await obsService.connect(storedPassword, storedIp, storedPort);
                if (errorMessage) {
                    setErrorMessage(errorMessage);
                } else {
                    navigation
                    navigation.navigate('sceneScreen', { obsService: obsService });
                }
            }
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const manuallyConnect = async () => {

        if (!customIp.startsWith("ws://")) {
            setCustomIp("ws://" + customIp);
        }

        const errorMessage: string = await obsService.connect(password, customIp, customPort);
        if (errorMessage) {
            setErrorMessage(errorMessage);
        } else {

            if (storeSession) {
                saveSession(password, customIp, customPort);
            }
            navigation.navigate('sceneScreen', { obsService: obsService });
        }
    }



    if (loading) {
        return (
            <LoadingIndicator text='Connecting...' />
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignContent: 'center' }}>

            <Text style={{ marginTop: 50, color: '#404E5C', fontSize: 30, textAlign: 'center', fontWeight: '700' }}>Connect</Text>
            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: 'white', paddingVertical: 8, fontSize: 20 }}>Password</Text>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                    <TextInput secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        placeholder='Password'
                        placeholderTextColor="#aaa"
                        style={{
                            flex: 1,
                            color: '#404E5C',
                            padding: 10,
                            backgroundColor: '#FFFFFF',
                            fontSize: 16,
                            borderBottomWidth: 1,
                            borderRadius: 4,
                            borderBottomColor: '#aaa'
                        }}></TextInput>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#404E5C"
                            style={{ margin: 10 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', paddingVertical: 16, alignContent: 'center' }}>
                    <Checkbox
                        disabled={false}
                        value={storeSession}
                        onValueChange={(newValue) => setStoreSession(newValue)}></Checkbox>
                    <Text style={{ color: '#404E5C', paddingLeft: 8, fontSize: 16 }}>Store session</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={{ alignSelf: 'center', paddingBottom: 16 }} onPress={() => setShowAdvanced(!showAdvanced)}>
                        <Text style={{ textAlign: 'center', alignSelf: 'flex-start', fontSize: 16, color: EStyleSheet.value('$default'), borderBottomColor: '#0085FF', borderBottomWidth: 1 }}>Advanced</Text>
                    </TouchableOpacity>
                    {
                        showAdvanced && (
                            <View style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
                                <TextInput
                                    value={customIp}
                                    onChangeText={setCustomIp}
                                    placeholder='IP address'
                                    placeholderTextColor="#aaa"
                                    style={{
                                        color: '#404E5C',
                                        padding: 10,
                                        marginBottom: 20,
                                        backgroundColor: '#FFFFFF',
                                        fontSize: 16,
                                        borderBottomWidth: 1,
                                        borderRadius: 4,
                                        borderBottomColor: '#aaa'
                                    }}></TextInput>
                                <TextInput
                                    value={customPort}
                                    onChangeText={setCustomPort}
                                    placeholder='Port'
                                    placeholderTextColor="#aaa"
                                    style={{
                                        color: '#404E5C',
                                        padding: 10,
                                        backgroundColor: '#FFFFFF',
                                        marginBottom: 20,
                                        fontSize: 16,
                                        borderBottomWidth: 1,
                                        borderRadius: 4,
                                        borderBottomColor: '#aaa'
                                    }}></TextInput>
                            </View>
                        )
                    }
                </View>

            </View>
            {
                errorMessage && <Text style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>Could not connect: {errorMessage}</Text>
            }
            <View style={{}}>
                <TouchableOpacity style={{ backgroundColor: EStyleSheet.value('$default'), height: 50, justifyContent: 'center', alignContent: 'center', margin: 16, borderRadius: 4 }}
                    onPress={() => manuallyConnect()}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 20 }}>Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialCommunityIcons />
                </TouchableOpacity>
            </View>
        </View>
    )
}