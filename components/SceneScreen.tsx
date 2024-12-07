import OBSWebSocket from "obs-websocket-js";
import { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, ListRenderItem, Text, TouchableOpacity, View } from "react-native"
import { LoadingIndicator } from "./LoadingIndicator";
import { Scene } from "../Interfaces/Scene";
import { Stats } from "../Interfaces/Stats";
import EStyleSheet from "react-native-extended-stylesheet";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emitter } from "../CustomEventEmitter";
import { DropdownOption } from "../Interfaces/DropdownOption";
import { SceneItem } from "../Interfaces/SceneItem";
import ObsService from "../services/ObsService";
import { ObsType, TypeDetails } from "../Interfaces/Constants";

export function SceneScreen(props: { navigation: any, route: any }) {

    const numColumns = 2
    const itemWidth = Dimensions.get('window').width / numColumns;

    const { navigation, route } = props;
    const obsService: ObsService = route.params.obsService;

    const [loading, setLoading] = useState<boolean>(false);
    const [scenes, setScenes] = useState<Scene[]>();
    const [selectedScene, setSelectedScene] = useState<Scene>();
    const [sceneItems, setSceneItems] = useState<SceneItem[]>();
    const [stats, setStats] = useState<Stats>();
    const [live, setLive] = useState<boolean>(false);
    const [isFocus, setIsFocus] = useState(false);
    const [dropDownOptions, setDropdownOptions] = useState<DropdownOption[]>([{
        label: '',
        value: ''
    }]);

    const load = async () => {
        setLoading(true);

        // Should be moved to a service class;
        try {
            const sceneList = await obsService.getScenes();

            const currentSceneName = await obsService.getCurrentScene();
            const currentScene = sceneList.find((scene) => scene.sceneName == currentSceneName);

            setScenes(sceneList);
            setSelectedScene(currentScene);
            console.log(currentScene?.sceneItems);
            setSceneItems(currentScene?.sceneItems);

            const statsData = await obsService.getStats();
            setStats(statsData);

            const streamStatus = await obsService.getStreamStatus();
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


    useEffect(() => {
        const listener = () => {
            console.log('Event triggered')
            load();
        }
        emitter.on('configAddedEvent', listener);

        return () => {
            emitter.off('configAddedEvent', listener)
        }
    }, []);

    const changeSceneConfiguration = async (item: Scene) => {
        try {
            if (selectedScene !== item) {
                setSelectedScene(item);
                setSceneItems(item?.sceneItems);
                await obsService.setScene(item.sceneName);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    const updateSceneConfiguration = (item: SceneItem, response: any) => {
        if (typeof response === "boolean") {
            setSceneItems((prevItems) =>
                prevItems!.map((sceneItem) =>
                    sceneItem.sourceName === item.sourceName ? { ...sceneItem, sourceActive: response } : sceneItem
                )
            );
        }
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

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleItemAction = async (item: SceneItem) =>  {
        switch (item.sourceType) {    
            case ObsType.BROSWER_SOURCE:
            case ObsType.DSHOW_INPUT:
            case ObsType.GAME_CAPTURE:
            case ObsType.MONITOR_CAPTURE:
            case ObsType.WASAPI_OUTPUT_CAPTURE:
                await obsService.setSceneItemEnabled(item.sourceId, item.sourceParentSceneName, !item.sourceActive);
                return !item.sourceActive;
            case ObsType.WASAPI_INPUT_CAPTURE:
                return await obsService.toggleInput(item.sourceName);
            default:
                console.log("Invalid type.");
                break;
        }
        return null;
    }

    const Row = ({ item, index }: { item: SceneItem, index: number }) => {

        const label = item.sourceType ? TypeDetails[item.sourceType].label : 'Unknown';
        const color = item.sourceType ? TypeDetails[item.sourceType].color : EStyleSheet.value('$default');

        return (
            <TouchableOpacity
                onPress={
                    async () => {
                        const response = await handleItemAction(item);
                        console.log(response);
                        updateSceneConfiguration(item, response);
                    }
                }
                style={[{
                    borderRadius: 6,
                    aspectRatio: 1,
                    backgroundColor: item.sourceActive ? color : '#FF2828',
                    margin: 4,
                    alignContent: 'center',
                    justifyContent: 'center',
                    width: itemWidth - 8
                },
                ]}
            >
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 20 }}>{item.sourceName}</Text>
                <Text style={{ position: 'absolute', top: 4, left: 4, color: 'white' }}>{label}</Text>
            </TouchableOpacity>)
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
                    borderRadius: 6,
                    padding: 12,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,

                    elevation: 2,

                }, isFocus && { shadowColor: EStyleSheet.value('$default') }]}
                    data={scenes!}
                    placeholder={!isFocus ? 'Select item' : '...'}
                    selectedTextStyle={{ fontSize: 16, }}
                    labelField='sceneName'
                    valueField='sceneName'
                    value={selectedScene}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item: Scene) => {
                        changeSceneConfiguration(item);
                        setIsFocus(false);
                    }}
                >
                </Dropdown>
            </View>
            <FlatList
                scrollEnabled={true}
                numColumns={numColumns}
                data={sceneItems}
                renderItem={({ item, index }) => <Row item={item} index={index} />}
                keyExtractor={(item: SceneItem, index: number) => item.sourceName}
                keyboardShouldPersistTaps='always'
            />
            {

                stats && (
                    <View style={{ backgroundColor: EStyleSheet.value('$default'), flexDirection: 'row', padding: 4 }}>
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