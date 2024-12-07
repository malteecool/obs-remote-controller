import OBSWebSocket from "obs-websocket-js";
import { Scene } from "../Interfaces/Scene";
import { Stats } from "../Interfaces/Stats";
import { SceneItem } from "../Interfaces/SceneItem";
import { ObsType, ObsTypeHelper } from "../Interfaces/Constants";

export default class ObsService {

    public obs: OBSWebSocket;

    constructor() {
        this.obs = new OBSWebSocket();
    }

    public async connect(password: string, ipAddress: string, port: string) {

        let errorMessage = ''
        try {
            const { obsWebSocketVersion, negotiatedRpcVersion } = await this.obs.connect((ipAddress) + ':' + (port), password);
            console.log(`Connected to server ${obsWebSocketVersion}`);
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = error.message;
                console.log(error);
            }
        } finally {
            return errorMessage
        }
    }

    public async getScenes(): Promise<Scene[]> {
        const { scenes } = await this.obs.call('GetSceneList');
        const scenesMapped = scenes as unknown as Scene[];
        scenesMapped.forEach(async (scene: Scene) => scene.sceneItems = await this.getSceneItems(scene.sceneName));
        return scenesMapped;
    }

    public async getCurrentScene(): Promise<string> {
        const { currentProgramSceneName } = await this.obs.call('GetSceneList');
        return currentProgramSceneName;
    }

    public async getStats(): Promise<Stats> {
        const stats = await this.obs.call('GetStats');
        return stats as Stats;
    }

    public async getStreamStatus(): Promise<any> {
        const status = await this.obs.call('GetStreamStatus');
        return status;
    }

    public async toggleInput(inputName: string): Promise<boolean> {
        const { inputMuted } = await this.obs.call('ToggleInputMute', { inputName: inputName });
        const enabled = !inputMuted;
        return enabled;
    }

    public async setSceneItemEnabled(sceneItemId: number, sceneName: string, enable: boolean) {
        await this.obs.call('SetSceneItemEnabled', {
            sceneName: sceneName,
            sceneItemId: sceneItemId,
            sceneItemEnabled: enable
        })
    }

    public async setScene(sceneName: string) {
        await this.obs.call('SetCurrentProgramScene', { sceneName: sceneName });
    }

    public async getSceneItems(sceneName: string): Promise<SceneItem[]> {
        const sceneItems = await this.obs.call('GetSceneItemList', { sceneName: sceneName });
        return this.mapSceneInputs(sceneName, sceneItems.sceneItems);
    }

    private async handleItemAction(item: SceneItem): Promise<any> {
        console.log(item.sourceType);
        switch (item.sourceType) {    
            case ObsType.BROSWER_SOURCE:
            case ObsType.DSHOW_INPUT:
            case ObsType.GAME_CAPTURE:
            case ObsType.MONITOR_CAPTURE:
            case ObsType.WASAPI_OUTPUT_CAPTURE:
                console.log(item.sourceActive);
                await this.setSceneItemEnabled(item.sourceId, item.sourceParentSceneName, !item.sourceActive);
                return !item.sourceActive;
            case ObsType.WASAPI_INPUT_CAPTURE:
                return await this.toggleInput(item.sourceName);
            default:
                console.log("Invalid type.");
                break;
        }
        return null;
    }

    private mapSceneInputs(sceneName: string, sceneItems: any[]): SceneItem[] {
        if (sceneItems == null || sceneItems.length == 0) {
            return [];
        }
        let mappedSceneItems: SceneItem[] = [];
        sceneItems.forEach((item) => {
            const type = ObsTypeHelper.lookup(item.inputKind);

            const newItem: SceneItem = {
                sourceId: item.sceneItemId,
                sourceName: item.sourceName,
                sourceType: type,
                sourceActive: item.sceneItemEnabled,
                sourceParentSceneName: sceneName
            }
            newItem.sourceAction = async () => {
                return await this.handleItemAction(newItem);
            }
            mappedSceneItems.push(newItem);
        });
        return mappedSceneItems;
    }
}