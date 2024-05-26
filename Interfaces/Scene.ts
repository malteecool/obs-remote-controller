import { BaseItem } from "./Item"

export enum SceneType {
    DEFAULT,
    SCENE,
    SOURCE,
    INPUT,
}

export interface Scene extends BaseItem {
    sceneIndex: number,
    sceneName: string
}

export interface SceneItem {
    inputKind: string,
    isGroup: string | null,
    sceneItemBlendMode: string, 
    sceneItemEnabled: boolean,
    sceneItemId: number,
    sceneItemIndex: number,
    sceneItemLocked: boolean,
    sceneItemTransform: null,
    sourceName: string,
    sourceType: string,
}


export interface SceneWrapper {
    scene: Scene,
    sceneItems: SceneItem[]
}