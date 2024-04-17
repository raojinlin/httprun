import { Form, Input, Modal } from "antd";
import React from "react";
import { TokenProps } from "./type";


const Token: React.FC<TokenProps> = ({ open, onOk, onOpenChange }) => {
    const [form] = Form.useForm();
    const handleTokenSave = React.useCallback(() => {
        form.validateFields().then(() => {
            const token = form.getFieldValue("token");
            window.localStorage.setItem("token", token);
            if (onOk) {
                onOk(token);
            }
        }).catch(err => {

        }); 
    }, [form, onOk]);
    return (
        <Modal open={open} title='设置Token' okText='保存' cancelText='取消' onOk={handleTokenSave} onCancel={() =>onOpenChange && onOpenChange(false)}>
            <Form form={form} onSubmitCapture={handleTokenSave}>
                <Form.Item name='token' label='Token'>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}


export default Token;