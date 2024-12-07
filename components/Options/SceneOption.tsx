import OBSWebSocket from "obs-websocket-js"
import { Scene } from "../../Interfaces/Scene"
import { Text, TouchableOpacity } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";
import { setScene } from "../../services/ObsService";

const SceneOption = (props: { obs: OBSWebSocket, item: Scene, itemWidth: number }) => {

    const { obs, item, itemWidth } = props;

    return (
        <TouchableOpacity
            style={[{
                borderRadius: 6,
                aspectRatio: 1,
                backgroundColor: EStyleSheet.value('$default'),
                margin: 4,
                alignContent: 'center',
                justifyContent: 'center',
                width: itemWidth - 8
            },
            ]}
            onPress={() => setScene(obs, item.sceneName)}
        >
            <Text style={{ textAlign: 'center', color: 'white', fontSize: 20 }}>{item.name ? item.name : item.sceneName}</Text>
            <Text style={{ position: 'absolute', top: 4, left: 4, color: 'white' }}>Scene</Text>
        </TouchableOpacity>
    )
}

export default SceneOption;
