import OBSWebSocket from "obs-websocket-js";
import { Scene, SceneItem, SceneType, SceneWrapper } from "../Interfaces/Scene";
import { Stats } from "../Interfaces/Stats";
import { Source } from "../Interfaces/Hotkey";
import { Input } from "../Interfaces/Input";

export async function connect(obs: OBSWebSocket, password: string, ipAddress: string, port: string) {

    const defaultIP: string = 'ws://192.168.1.166';
    const defaultPort: string = '4455'

    let errorMessage = ''
    try {
        const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect((ipAddress ? ipAddress : defaultIP) + ':' + (port ? port : defaultPort), password);
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

export async function getScenes(obs: OBSWebSocket): Promise<Scene[]> {
    const { scenes } = await obs.call('GetSceneList');
    const scenesMapped = scenes as unknown as Scene[];
    scenesMapped.forEach((scene: Scene) => scene.type = SceneType.SCENE);
    return scenesMapped;
}

/*export async function getHotkeys(obs: OBSWebSocket): Promise<Hotkey[]> {
    const { hotkeys } = await obs.call('GetHotkeyList')
    const hotKeysMapped = hotkeys as unknown as Hotkey[];
    return hotKeysMapped;
}*/

export async function getStats(obs: OBSWebSocket): Promise<Stats> {
    const stats = await obs.call('GetStats');
    console.log(stats);
    return stats as Stats;
}

export async function getInputList(obs: OBSWebSocket, type: string | undefined): Promise<Input[]> {
    const inputs = await obs.call('GetInputList');
    const inputsMapped = (inputs).inputs as unknown as Input[];
    if (type) {
        return inputsMapped.filter((input) => input.inputKind == type);
    }
    return inputsMapped;
}

export async function getInputMute(obs: OBSWebSocket, inputName: string): Promise<boolean> {
    const { inputMuted } = await obs.call('GetInputMute', { inputName: inputName });
    return inputMuted;
}

export async function toggleInput(obs: OBSWebSocket, inputName: string): Promise<boolean> {
    const { inputMuted } = await obs.call('ToggleInputMute', { inputName: inputName });
    return inputMuted;
}

export async function setScene(obs: OBSWebSocket, sceneName: string) {
    await obs.call('SetCurrentProgramScene', { sceneName: sceneName });
}

export async function getSceneItems(obs: OBSWebSocket, sceneName: string): Promise<SceneItem[]> {
    const sceneItems = await obs.call('GetSceneItemList', {sceneName: sceneName});
    const sourceTypes: string[] = [
        'monitor_capture',
        'game_capture',
        'dshow_input',
        'browser_source',
    ]
    
    return sceneItems.sceneItems.filter((item) => sourceTypes.includes(item.inputKind as string)) as unknown as SceneItem[];
}
