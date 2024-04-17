export type TokenProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOk?: (token: string) => void;
}