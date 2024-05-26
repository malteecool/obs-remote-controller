import { BaseItem } from "./Item";

export interface Input extends BaseItem{
    inputKind: string,
    inputName: string,
    unversionedInputKind: string,
}