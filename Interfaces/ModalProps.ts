import { TextInput } from "react-native";
import { SceneType } from "./Scene";
import OBSWebSocket from "obs-websocket-js";
import { Item } from "./Item";

export interface ModalProps {
    obs: OBSWebSocket,
    modalVisible: boolean;
    closeModal: () => void;
    saveItem: (Item: Item, sceneType: SceneType) => void;
}