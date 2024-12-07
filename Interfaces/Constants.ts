export enum ObsType {
    MONITOR_CAPTURE = "monitor_capture",
    GAME_CAPTURE = "game_capture",
    DSHOW_INPUT = "dshow_input",
    BROSWER_SOURCE = "browser_source",
    WASAPI_INPUT_CAPTURE = "wasapi_input_capture",
    WASAPI_OUTPUT_CAPTURE = "wasapi_output_capture",
}

export const TypeDetails = {
    [ObsType.MONITOR_CAPTURE]: {color: '#9146FF', label: 'Monitor Capture'},
    [ObsType.GAME_CAPTURE]: {color: '#9146FF', label: 'Game Capture'},
    [ObsType.DSHOW_INPUT]: {color: '#9146FF', label: 'Video input'},
    [ObsType.BROSWER_SOURCE]: {color: '#9146FF', label: 'Broswer source'},
    [ObsType.WASAPI_INPUT_CAPTURE]: {color: '#9146FF', label: 'Input capture'},
    [ObsType.WASAPI_OUTPUT_CAPTURE]: {color: '#9146FF', label: 'Output Capture'},
}

export class ObsTypeHelper {
    static lookup(name: string): ObsType | undefined {
        return (Object.values(ObsType) as String[]).includes(name) ? name as ObsType : undefined;
    }
}
