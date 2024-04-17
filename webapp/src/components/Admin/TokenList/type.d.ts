import { CreateTokenResponse } from "../../../services/type";

export type AddTokenModalProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onChange?: (res: CreateTokenResponse) => void;
}