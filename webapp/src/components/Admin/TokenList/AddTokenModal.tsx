import { Form, Modal, Input, DatePicker, Select, message } from "antd";
import React from "react";
import commandService from "../../../services/command";
import { CreateTokenRequest } from "../../../services/type";
import dayjs from 'dayjs';


const AddTokenModal: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();
    const handleSubmit = React.useCallback(() => {
        form.validateFields().then(() => {
            setLoading(true);
            const value = form.getFieldsValue();
            const req = {...value} as CreateTokenRequest;
            req.issue_at = parseInt(String(Date.now() / 1000))
            req.expires_at = dayjs(value.expires_at).unix();
            commandService.addToken(req).then(() => {
                setLoading(false);
                message.success('添加成功');
                form.resetFields();
            }).catch(() => {
                setLoading(false);
                message.error('添加失败');
            })
        }).catch(err => {
            message.error('请填写参数');
        })
    }, [form]);
    return (
        <Modal title='添加token' open okText='创建' cancelText='取消' okButtonProps={{onClick: handleSubmit, loading: loading}}>
            <Form labelCol={{span: 4}} form={form}>
                <Form.Item label='名称' name='name' rules={[{required: true}]}>
                    <Input />
                </Form.Item>
                <Form.Item label='命令' name='subject' rules={[{required: true}]}>
                    {/* <Select></Select> */}
                    <Input />
                </Form.Item>
                <Form.Item label='ExpiresAt' name='expires_at' rules={[{required: true}]}>
                    <DatePicker showTime />
                </Form.Item>
            </Form>
        </Modal>
    )
};


export default AddTokenModal;