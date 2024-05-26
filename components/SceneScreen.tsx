import OBSWebSocket from "obs-websocket-js";
import { useEffect, useState } from "react";
import { Alert, BackHandler, Dimensions, FlatList, ListRenderItem, Text, TouchableOpacity, View } from "react-native"
import { LoadingIndicator } from "./LoadingIndicator";
import { Scene, SceneType } from "../Interfaces/Scene";
import { Stats } from "../Interfaces/Stats";
import EStyleSheet from "react-native-extended-stylesheet";
import { getInputList, getInputMute, getScenes, getStats, setScene, toggleInput } from "../services/ObsService";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SceneConfig } from "../Interfaces/SceneConfig";
import { emitter } from "../CustomEventEmitter";
import InputOption from "./Options/InputOption";
import SceneOption from "./Options/SceneOption";
import { Item } from "../Interfaces/Type";
import { Source } from "../Interfaces/Hotkey";
import { Input } from "../Interfaces/Input";

export function SceneScreen(props: { navigation: any, route: any }) {

    const numColumns = 2
    const itemWidth = Dimensions.get('window').width / numColumns;

    const { navigation, route } = props;
    const obs: OBSWebSocket = route.params.obs;

    const [loading, setLoading] = useState<boolean>(false);
    const [scenes, setScenes] = useState<Scene[]>();
    const [stats, setStats] = useState<Stats>();
    const [live, setLive] = useState<boolean>(false);
    const [sceneConfigs, setSceneConfigs] = useState<SceneConfig[]>();
    const [dropdownValue, setDropdownValue] = useState<string>();
    const [isFocus, setIsFocus] = useState(false);
    const [dropDownOptions, setDropdownOptions] = useState<{ label: string, value: string }[]>([{
        label: '',
        value: ''
    }]);

    const load = async () => {
        setLoading(true);
        try {

            const defaultDropdownOptions: [{ label: string, value: string }] = [{
                label: 'Default configuration',
                value: 'default'
            }];
            // If no stored scene configs exist we display everything!
            const storedSceneConfigs = await AsyncStorage.getItem('sceneConfig');
            console.log('StoredSceneConfig: ' + storedSceneConfigs);
            // Need extra validation for edge cases. Stored and removed config items will be stored as "[]".
            if (storedSceneConfigs && (JSON.parse(storedSceneConfigs)) && (JSON.parse(storedSceneConfigs) as SceneConfig[]).length > 0) {

                const parsedConfigs = JSON.parse(storedSceneConfigs) as SceneConfig[];
                setSceneConfigs(parsedConfigs);
                parsedConfigs.forEach((sceneConfig: SceneConfig) => {
                    defaultDropdownOptions.push({
                        label: sceneConfig.configTitle,
                        value: sceneConfig.configTitle
                    })
                });
            } else {
                
            }
            const sceneList = await getScenes(obs);
            setScenes(sceneList);

            defaultDropdownOptions.push({
                label: 'New',
                value: 'new'
            });
            setDropdownOptions(defaultDropdownOptions);
            setDropdownValue(defaultDropdownOptions[0].value);

            const statsData = await getStats(obs);
            setStats(statsData);

            const streamStatus: any = obs.call('GetStreamStatus');
            setLive(streamStatus.outputActive);

        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    /*useEffect(() => {
        const interval = setInterval(async () => {
            const statsData = await getStats(obs);
            setStats(statsData);

            const streamStatus: any = obs.call('GetStreamStatus');
            setLive(streamStatus.outputActive);
        }, 2000);

        return () => clearInterval(interval);
    }, [stats]);*/


    useEffect(() => {
        const listener = () => {
            console.log('Event triggered')
            setDropdownValue(dropDownOptions[0].value)
            load();
        }
        emitter.on('configAddedEvent', listener);

        return () => {
            emitter.off('configAddedEvent', listener)
        }
    }, []);

    const handleClick = async (item: Item) => {

        switch (item.type) {
            case SceneType.SCENE:
                await setScene(obs, (item as Scene).sceneName);
                break;
            case SceneType.INPUT:
                await toggleInput(obs, (item as Input).inputName);
                break;
            case SceneType.SOURCE:
                console.log('toggle source');
                break;
            default:
                console.log('Invalid item');
                break;
        }

    }


    const changeSceneConfiguration = async (item: { label: string, value: string }) => {

        // Need better way to handle the default dropdown options.

        if (item.value == 'new') {
            setDropdownValue('default');
            navigation.navigate('newSceneConfigScreen', { obs: obs });
            return;
        }

        try {
            setLoading(true);
            if (item.value == 'default') {
                const sceneList = await getScenes(obs);
                setScenes(sceneList);
            } else if (sceneConfigs) {
                const selectedConfig = sceneConfigs.filter((config) => config.configTitle == item.value);
                setScenes(selectedConfig[0].sceneItems);
            }
            // dropdown value
            setDropdownValue(item.value);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    }

    const dropDownRenderItem = (item: any) => {
        return (
            <View style={{
                padding: 17,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <Text style={{
                    flex: 1,
                    fontSize: 16
                }}>{item.label}</Text>
                {item.value === 'new' ? (
                    <MaterialCommunityIcons name='plus-circle' size={24} color='gray' />
                ) : (item.value != 'default') && <MaterialCommunityIcons name='trash-can' size={24} color='gray' onPress={() => warnUser(item)} />}
            </View>
        )
    }

    const warnUser = (item: { label: string, value: string }) => {
        Alert.alert('Remove scene configuration', 'Are you sure you want to delete config ' + item.value + '?', [
            {
                text: 'Cancel',
                onPress: () => { return; },
                style: 'cancel',
            },
            { text: 'OK', onPress: () => removeConfiguration(item) },
        ]);
    }

    const removeConfiguration = async (item: { label: string, value: string }) => {
        console.log('removeConfiguration');

        setLoading(true);
        try {
            const index = sceneConfigs?.findIndex((config) => config.configTitle == item.value);
            const filteredConfigs = sceneConfigs?.filter((config) => config.configTitle != item.value);
            const filteredDropDownOptions = dropDownOptions.filter((option) => option.value != item.value);
            setSceneConfigs(filteredConfigs);
            setDropdownOptions(filteredDropDownOptions);
            if (index && index > -1 && filteredConfigs) {
                setDropdownValue(dropDownOptions[index - 1].value);
                setScenes(filteredConfigs[index - 1].sceneItems)
            } else {
                setDropdownValue(dropDownOptions[0].value);
                const sceneList = await getScenes(obs);
                setScenes(sceneList);
            }
            await AsyncStorage.setItem('sceneConfig', JSON.stringify(filteredConfigs));

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }


    }

    const Row = ({ item, index }: { item: Item, index: number }) => {
        // To handle the case if there is only one item at a certain row.
        if (scenes) {

            if (item.type == SceneType.INPUT) {
                return (
                    <InputOption obs={obs} item={item as Input} itemWidth={itemWidth} />
                )
            }

            if (item.type == SceneType.SCENE) {
                return (
                    <SceneOption obs={obs} item={item as Scene} itemWidth={itemWidth} />
                )
            }
        }
        return (
            <View style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center'
            }}>
                <Text style={{ textAlign: 'center', fontSize: 20 }}>No commands found. Add a new configutation or create scenes in obs.</Text>
            </View>
        )
    }

    if (loading) {
        return (
            <LoadingIndicator text='Loading scenes...' />
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
            <View style={{ height: 'auto' }}>
                <Dropdown style={[{
                    margin: 4,
                    marginTop: 0,
                    height: 50,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 12,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,

                    elevation: 2,

                }, isFocus && { shadowColor: EStyleSheet.value('$color') }]}
                    data={dropDownOptions}
                    placeholder={!isFocus ? 'Select item' : '...'}
                    selectedTextStyle={{ fontSize: 16, }}
                    labelField='label'
                    valueField='value'
                    value={dropdownValue}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item: { label: string, value: string }) => {
                        changeSceneConfiguration(item);
                        setIsFocus(false);
                    }}
                    renderItem={dropDownRenderItem}
                >

                </Dropdown>
            </View>
            <FlatList
                contentContainerStyle={{ flex: 1 }}
                numColumns={numColumns}
                data={scenes}
                renderItem={({ item, index }) => <Row item={item} index={index} />}
                keyExtractor={(item: Scene, index: number) => item.sceneName}
                keyboardShouldPersistTaps='always'
            />
            {
                stats && (
                    <View style={{ backgroundColor: EStyleSheet.value('$color'), flexDirection: 'row', padding: 4 }}>
                        <Text style={{ color: 'white', marginHorizontal: 4 }}>FPS: {stats.activeFps.toFixed(0)}</Text>
                        <Text style={{ color: 'white', marginHorizontal: 4 }}>Dropped frames: {stats.outputSkippedFrames}</Text>
                        <View style={{ flex: 1 }}>
                            {
                                live ?
                                    <Text style={{ textAlign: 'right', color: 'white' }}><MaterialCommunityIcons color={'red'} name="checkbox-blank-circle" /> Live</Text>
                                    :
                                    <Text style={{ textAlign: 'right', color: 'white' }}><MaterialCommunityIcons color={'white'} name="checkbox-blank-circle" /> Offline</Text>
                            }
                        </View>
                    </View>
                )
            }

        </View>
    )
}