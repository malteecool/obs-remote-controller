import { BaseItem } from "./Item";
import { SceneItem } from "./Scene";

export interface Source extends BaseItem {
    sourceItem: SceneItem
}