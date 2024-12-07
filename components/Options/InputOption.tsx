import EStyleSheet from "react-native-extended-stylesheet"
import { Scene } from "../../Interfaces/Scene"
import { Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getInputMute, toggleInput } from "../../services/ObsService";
import OBSWebSocket from "obs-websocket-js";
import { Input } from "../../Interfaces/Input";

const InputOption = (props: { obs: OBSWebSocket, item: Input, itemWidth: number }) => {

    const { obs, item, itemWidth } = props;

    const [toggled, setToggled] = useState<boolean>();

    const load = async () => {
        const isToggled = await getInputMute(obs, item.inputName);
        setToggled(!isToggled);
    }

    useEffect(() => {
        load();
    }, []);


    const onToggle = async () => {
        // muted = true, unMuted = false
        const isToggled = await toggleInput(obs, item.inputName);
        setToggled(!isToggled);
    }

    return (
        <TouchableOpacity
            style={[{
                borderRadius: 6,
                aspectRatio: 1,
                margin: 4,
                alignContent: 'center',
                justifyContent: 'center',
                width: itemWidth - 8
            },
            toggled ? { backgroundColor: EStyleSheet.value('$default') } : { backgroundColor: '#ff4646' }
            ]}
            onPress={() => { onToggle() }}
        >
            <Text style={{ textAlign: 'center', color: 'white', fontSize: 20 }}>{item.name}</Text>
            <Text style={{ position: 'absolute', top: 4, left: 4, color: 'white' }}>Input</Text>
        </TouchableOpacity>
    )

}

export default InputOption;