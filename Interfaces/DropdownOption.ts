export interface DropdownOption {
    label: string;
    value: string;
    // Used to determine if a scene collection is loaded from obs or user added.
    obsLoaded?: boolean;
    removable?: boolean;
}