import { CommandItem } from '../../../services/type';
export type EditorProps = {
    open?: boolean;
    onClose?: () => void;
    command: CommandItem;
    onChange?: () => void;
};