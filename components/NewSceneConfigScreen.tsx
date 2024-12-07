import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LegacyRef, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { Scene, SceneType } from "../Interfaces/Scene";
import { SceneConfig } from "../Interfaces/SceneConfig";
import { emitter } from "../CustomEventEmitter";
import { getScenes } from "../services/ObsService";
import OBSWebSocket from "obs-websocket-js";
import CustomModal from "./CustomModal";
import { Item } from "../Interfaces/Type";
import { Input } from "../Interfaces/Input";
import { Source } from "../Interfaces/Hotkey";

export function NewSceneConfigScreen(props: { navigation: any, route: any }) {

    const { navigation, route } = props;
    const obs: OBSWebSocket = route.params.obs;

    const [loading, setLoading] = useState<boolean>(false);
    const [isFocus, setIsFocus] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [obsItems, setObsItem] = useState<Scene[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const numColumns = 2
    const itemWidth = Dimensions.get('window').width / numColumns;

    const load = async () => {
        try {
            //const scenes = await getScenes(obs);
            //setObsItem(scenes);
        } catch (error) {
            console.log(error);
        }
    }


    const _save = async () => {
        if (!title) {
            setErrorMessage('Title is required');
            return;
        }
        setLoading(true);
        try {
            console.log(selectedItems);
            const filteredItems = selectedItems;//.filter((item: Scene) => item.sceneIndex !== 0);
            console.log(filteredItems);
            const newSceneConfig: SceneConfig = {
                configTitle: title,
                scenes: filteredItems
            }
            //await AsyncStorage.removeItem('sceneConfig');
            const sceneConfigs = await AsyncStorage.getItem('sceneConfig');
            if (sceneConfigs) {
                const parsed = JSON.parse(sceneConfigs) as SceneConfig[];
                parsed.push(newSceneConfig);
                console.log(JSON.stringify(parsed));
                await AsyncStorage.setItem('sceneConfig', JSON.stringify(parsed));

            } else {
                console.log(JSON.stringify([newSceneConfig]))
                await AsyncStorage.setItem('sceneConfig', JSON.stringify([newSceneConfig]));
            }
        } catch (error) {
            console.log(error);
        } finally {
            emitter.emit('configAddedEvent', 0);
            navigation.goBack();
        }

    }

    useEffect(() => {
        load();
    }, []);

    // Handle the backbutton.
    useEffect(() => {
        const backAction = () => {
            Alert.alert('Hold on!', 'Are you sure you want discard the config?', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: 'YES', onPress: () => {
                        emitter.emit('configAddedEvent', 0);
                        navigation.goBack();
                    }
                },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    const closeModal = () => {
        setModalVisible(false);
    }

    const showModal = () => {
        setModalVisible(true);
    }

    const editSceneName = (scene: Scene, text: string) => {
        scene.sceneName.concat(text);
    }


    const _addScene = (scene: Scene) => {
        console.log(scene);
        const item: Scene = {
            name: scene.sceneName,
            type: SceneType.SCENE,
            sceneName: scene.sceneName,
            sceneIndex: selectedItems.length,
        }
        setSelectedItems([item, ...selectedItems]);
    }

    const _addInput = (input: Input) => {
        const item: Input = {
            name: input.inputName,
            type: SceneType.INPUT,
            inputKind: input.inputKind,
            inputName: input.inputName,
            unversionedInputKind: input.unversionedInputKind,
        }
        setSelectedItems([item, ...selectedItems]);
    }

    const _addSource = (source: Source) => {
        const item: Source = {
            name: source.sourceItem.sourceName,
            type: SceneType.SOURCE,
            sourceItem: { ...source.sourceItem }
        }
        setSelectedItems([item, ...selectedItems]);
    }

    const addItem = (item: Item, sceneType: SceneType) => {
        if (sceneType == SceneType.SCENE) {
            _addScene(item as Scene);
        }
        if (sceneType == SceneType.INPUT) {
            _addInput(item as Input);
        }
        if (sceneType == SceneType.SOURCE) {
            _addSource(item as Source);
        }
    }


    const RowAdd = () => {
        return (
            <TouchableOpacity
                style={[{
                    borderRadius: 6,
                    aspectRatio: 1,
                    backgroundColor: EStyleSheet.value('$default'),
                    margin: 4,
                    alignSelf: 'flex-end',
                    alignContent: 'center',
                    justifyContent: 'center',
                    width: itemWidth - 8,
                }]}
                onPress={showModal}
            >
                <MaterialCommunityIcons name='plus' size={24} color='white' style={{ textAlign: 'center' }} />
            </TouchableOpacity>
        )
    }

    const Row = ({ item, index }: { item: Item, index: number }) => {
        return (
            <TouchableOpacity
                style={[{
                    borderRadius: 6,
                    aspectRatio: 1,
                    backgroundColor: EStyleSheet.value('$default'),
                    margin: 4,
                    alignSelf: 'flex-end',
                    alignContent: 'center',
                    justifyContent: 'center',
                    width: itemWidth - 8
                }]}>
                <Text
                    style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 20
                    }}
                >{item.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>

            {
                modalVisible && <CustomModal
                    obs={obs}
                    modalVisible={modalVisible}
                    closeModal={closeModal}
                    saveItem={addItem}
                />
            }

            <View style={{ height: 'auto' }}>
                <TextInput
                    placeholder='Title'
                    style={[{
                        fontSize: 20,
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

                    }, isFocus && { borderWidth: 1, borderColor: EStyleSheet.value('$default') }]}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    value={title}
                    onChangeText={setTitle}
                >
                </TextInput>
            </View>


            <ScrollView
                style={{
                    flex: 1,
                }}
                contentContainerStyle={{
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }}
            >

                {
                    [...selectedItems].map((item, index) => {
                        return (
                            <Row item={item} index={index} key={item.name}/>
                        )
                    })
                }
                <RowAdd />
            </ScrollView>
            {
                errorMessage && (
                    <Text style={{ color: 'red', fontSize: 16, paddingHorizontal: 4 }}>{errorMessage}</Text>
                )
            }
            <TouchableOpacity
                style={{
                    height: 'auto',
                    paddingVertical: 12,
                    backgroundColor: EStyleSheet.value('$default'),
                    alignContent: 'flex-end',
                    justifyContent: 'center',
                    margin: 4,
                    borderRadius: 6,
                }}
                onPress={() => _save()}
            >
                <Text style={{
                    textAlign: 'center',
                    color: 'white',
                    fontSize: 20,
                }}>
                    Save
                </Text>
            </TouchableOpacity>
        </View>
    )

}