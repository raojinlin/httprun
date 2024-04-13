import { ParamDefine, CommandItem } from "../../../services/type";

export type EditorProps = {
    open: boolean;
    command: CommandItem;
    onClose?: () => void;
    action?: "edit"|"run";
};

export type ParamInputProps = {
    param: ParamDefine
    name: string;
    value?: any;
    checked?: boolean;
    onChange?: () => void;
};