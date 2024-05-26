import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { ModalProps } from "../Interfaces/ModalProps"
import EStyleSheet from "react-native-extended-stylesheet";
import { useEffect, useState } from "react";
import { Scene, SceneItem, SceneType, SceneWrapper } from "../Interfaces/Scene";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getInputList, getSceneItems, getScenes } from "../services/ObsService";
import { LoadingIndicator } from "./LoadingIndicator";
import { Input } from "../Interfaces/Input";
import { Item } from "../Interfaces/Type";

const CustomModal: React.FC<ModalProps> = ({ obs, modalVisible, closeModal, saveItem }) => {

    const [newSceneName, setNewSceneName] = useState<string>('');
    const [selectedType, setSelectedType] = useState<SceneType>(SceneType.SCENE);
    const controlOptions = [SceneType.SCENE, SceneType.SOURCE, SceneType.INPUT];
    const [errorMessage, setErrorMessage] = useState<string>();
    const [obsItems, setObsItem] = useState<Scene[]>([]);
    const [inputs, setInputs] = useState<Input[]>([]);
    const [sceneItemsWrappers, setSceneItemsWrappers] = useState<SceneWrapper[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const load = async () => {
        try {
            setLoading(true);
            const scenesList: Scene[] = await getScenes(obs);
            setObsItem(scenesList);

            const inputList: Input[] = (await getInputList(obs, 'wasapi_input_capture'));
            setInputs(inputList);

            if (scenesList) {
                const tempList: SceneWrapper[] = [];
                scenesList.forEach(async (scene: Scene) => {
                    const items: SceneItem[] = await getSceneItems(obs, scene.sceneName);
                    const wrapper: SceneWrapper = {
                        scene: scene,
                        sceneItems: items
                    };
                    tempList.push(wrapper);
                });
                setSceneItemsWrappers(tempList);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [])

    const handleSave = (newSceneName: Item, sceneType: SceneType) => {
        saveItem(newSceneName, sceneType);
    }

    const handleOnTypeChange = async (selectedIndex: number) => {

        const type = controlOptions[selectedIndex];
        setSelectedType(type);
        try {
            setLoading(true);
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const RenderScenes = () => {
        return (
            <ScrollView>
                <Text style={{
                    marginLeft: 3,
                    fontSize: 16,
                    textAlign: 'center',
                    color: '#404E5C',
                }}>Existing scenes</Text>
                {
                    obsItems.map((item) => {
                        return (
                            <TouchableOpacity style={{
                                margin: 3,
                                flex: 1,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                borderRadius: 9,
                                borderWidth: 0.5,
                                borderColor: 'rgba(0,0,0,0.04)',
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,
                                elevation: 3,
                                height: 50,

                            }}
                                onPress={() => {
                                    handleSave(item, SceneType.SCENE);
                                    closeModal();
                                }}
                            >
                                <View style={{

                                }}>
                                    <Text style={{ textAlign: 'center', color: '#404E5C', fontWeight: '700', fontSize: 16 }}>{item.sceneName}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        )
    }

    const RenderSource = () => {
        return (
            <View>
                <ScrollView>
                    {
                        sceneItemsWrappers.map((item) => {
                            return (
                                <View>
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: 20,
                                        paddingVertical: 4,
                                    }}>{item.scene.sceneName}</Text>
                                    {
                                        item.sceneItems && item.sceneItems.map((sceneItem) => {
                                            return (
                                                <TouchableOpacity style={{
                                                    margin: 3,
                                                    flex: 1,
                                                    backgroundColor: '#FFF',
                                                    justifyContent: 'center',
                                                    borderRadius: 9,
                                                    borderWidth: 0.5,
                                                    borderColor: 'rgba(0,0,0,0.04)',
                                                    shadowColor: '#000',
                                                    shadowOffset: {
                                                        width: 0,
                                                        height: 1,
                                                    },
                                                    shadowOpacity: 0.22,
                                                    shadowRadius: 2.22,
                                                    elevation: 3,
                                                    height: 50,
                                                }}
                                                onPress={() => {
                                                    //handleSave(sceneItem, SceneType.SOURCE)
                                                    closeModal();
                                                }}
                                                >
                                                    <View style={{
                                                    }}>
                                                        <Text style={{ textAlign: 'center', color: '#404E5C', fontWeight: '700', fontSize: 16 }}>{sceneItem.sourceName}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>

                            )
                        })
                    }
                </ScrollView>
            </View>
        )

    }

    const RenderInput = () => {
        return (
            <ScrollView>
                <Text style={{
                    marginLeft: 3,
                    fontSize: 16,
                    textAlign: 'center',
                    color: '#404E5C',
                }}>Available inputs</Text>
                {
                    inputs.map((item) => {
                        return (
                            <TouchableOpacity style={{
                                margin: 3,
                                flex: 1,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                borderRadius: 9,
                                borderWidth: 0.5,
                                borderColor: 'rgba(0,0,0,0.04)',
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,
                                elevation: 3,
                                height: 50,

                            }}
                                onPress={() => {
                                    handleSave(item, SceneType.INPUT);
                                    closeModal();
                                }}
                            >
                                <View>
                                    <Text style={{ textAlign: 'center', color: '#404E5C', fontWeight: '700', fontSize: 16 }}>{item.inputName}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        )
    }
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
                statusBarTranslucent={true}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 22,
                }}>
                    <View style={{
                        flex: 1,
                        margin: 20,
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 12,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        width: '90%',
                        height: 'auto',
                    }}>
                        <View style={{
                            flex: 1,
                            width: '100%',
                        }}>
                            <View style={{
                                position: 'relative',
                            }}>
                                <Pressable
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        zIndex: 1
                                    }}
                                    onPress={() => closeModal()}
                                >
                                    <MaterialCommunityIcons name="close" color={'#404E5C'} size={30} />
                                </Pressable>
                                <Text style={{ textAlign: 'center', color: '#404E5C', fontWeight: '700', fontSize: 30, padding: 10, }}>New item</Text>
                                <TextInput placeholder="Custom scene name"
                                    onChangeText={(text) => setNewSceneName(text)}
                                    value={newSceneName}
                                    style={{
                                        width: '100%',
                                        fontSize: 20,
                                        marginVertical: 10,
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
                                    }}
                                />
                                <SegmentedControl
                                    values={controlOptions.map(option => SceneType[option].toString())}
                                    selectedIndex={controlOptions.indexOf(selectedType)}
                                    onChange={(event) => handleOnTypeChange(event.nativeEvent.selectedSegmentIndex)}
                                    style={{
                                        marginVertical: 10,
                                        height: 50,
                                    }}
                                    fontStyle={{
                                        color: '#404E5C'
                                    }}
                                />
                            </View>

                            <View style={{
                                flex: 7
                            }}>
                                {
                                    loading ? (<LoadingIndicator text="" />)
                                        :
                                        (
                                            <View style={{

                                            }}>

                                                {
                                                    selectedType == SceneType.SCENE && (
                                                        <RenderScenes />
                                                    )
                                                }
                                                {
                                                    selectedType == SceneType.SOURCE && (
                                                        <RenderSource />
                                                    )
                                                }
                                                {
                                                    selectedType == SceneType.INPUT && (
                                                        <RenderInput />
                                                    )
                                                }

                                            </View>
                                        )
                                }
                            </View>

                            <View style={{
                                flex: 1,
                                justifyContent: 'flex-end'
                            }}>
                                <Pressable
                                    style={{
                                        borderRadius: 20,
                                        alignItems: 'center',
                                        elevation: 2,
                                        marginVertical: 10,
                                        height: 50,
                                        backgroundColor: EStyleSheet.value('$color'),
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        //handleSave(newSceneName, selectedType)
                                        closeModal();
                                    }}>
                                    <Text style={{
                                        fontSize: 20,
                                        color: 'white',
                                        textAlign: "center"
                                    }}>Save</Text>
                                </Pressable>
                            </View>
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default CustomModal;