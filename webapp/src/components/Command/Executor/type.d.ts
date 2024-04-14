import { ParamDefine, CommandItem } from "../../../services/type";

export type ExecutorProps = {
    open: boolean;
    command: CommandItem;
    onClose?: () => void;
    action?: "edit"|"run";
    readonly?: boolean;
};

export type ParamInputProps = {
    param: ParamDefine
    name: string;
    value?: any;
    checked?: boolean;
    onChange?: () => void;
};