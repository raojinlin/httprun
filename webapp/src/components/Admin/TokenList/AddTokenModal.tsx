import { Form, Modal, Input, DatePicker, Select, message } from "antd";
import React from "react";
import commandService from "../../../services/command";
import { CreateTokenRequest } from "../../../services/type";


const AddTokenModal: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();
    const handleSubmit = React.useCallback(() => {
        form.validateFields().then(() => {
            setLoading(true);
            form.resetFields();
            const value = form.getFieldsValue() as CreateTokenRequest;
            value.issuse_at = parseInt(Date.now() / 1000)
            commandService.addToken(value).then(() => {
                setLoading(false);
                message.success('添加成功');
                form.resetFields();
            }).catch(() => {
                setLoading(false);
                message.error('添加失败');
            })
        }).catch(err => {
            message.error(err.message);
        })
    }, [form]);
    return (
        <Modal title='添加token' open okText='创建' cancelText='取消' okButtonProps={{onClick: handleSubmit, loading: loading}}>
            <Form labelCol={{span: 4}} form={form}>
                <Form.Item label='名称' name='name' rules={[{required: true}]}>
                    <Input />
                </Form.Item>
                <Form.Item label='命令' name='subject' rules={[{required: true}]}>
                    <Select></Select>
                </Form.Item>
                <Form.Item label='ExpiresAt' name='expires_at' rules={[{required: true}]}>
                    <DatePicker showTime />
                </Form.Item>
            </Form>
        </Modal>
    )
};


export default AddTokenModal;