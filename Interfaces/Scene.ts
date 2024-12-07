import { SceneItem } from "./SceneItem";

export interface Scene {
    sceneIndex: number,
    sceneName: string,
    sceneItems?: SceneItem[];
}