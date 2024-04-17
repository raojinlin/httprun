import { Form, Modal, Input, DatePicker, Select, message } from "antd";
import React from "react";
import dayjs from 'dayjs';
import commandService from "../../../services/command";
import { CommandItem, CreateTokenRequest } from "../../../services/type";
import { AddTokenModalProps } from "./type";


const AddTokenModal: React.FC<AddTokenModalProps> = ({ open, onChange, onOpenChange }) => {
    const [commandList, setCommandList] = React.useState<CommandItem[]>([]);
    const [commandListLoading, setCommandListLoading] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();

    React.useEffect(() => {
        setCommandListLoading(true);
        commandService.getCommandList().then((commandList) => {
            setCommandListLoading(false);
            setCommandList(commandList);
        });
    }, []);

    const handleSubmit = React.useCallback(() => {
        form.validateFields().then(() => {
            setLoading(true);
            const value = form.getFieldsValue();
            const req = {...value} as CreateTokenRequest;
            req.issue_at = parseInt(String(Date.now() / 1000))
            req.expires_at = dayjs(value.expires_at).unix();
            req.subject = value.subject.join(',');
            commandService.addToken(req).then((res) => {
                setLoading(false);
                message.success('添加成功');
                if (onChange) {
                    onChange(res);
                }
                if (onOpenChange) {
                    onOpenChange(false);
                }
                form.resetFields();
            }).catch(() => {
                setLoading(false);
                message.error('添加失败');
            })
        }).catch(err => {
            message.error('请填写参数');
        })
    }, [form, onChange, onOpenChange]);

    return (
        <Modal 
            title='添加token' 
            onCancel={() => onOpenChange && onOpenChange(false)} 
            open={open} 
            okText='创建' 
            cancelText='取消' 
            okButtonProps={{onClick: handleSubmit, loading: loading}}
        >
            <Form labelCol={{span: 4}} form={form}>
                <Form.Item label='名称' name='name' rules={[{required: true}]}>
                    <Input />
                </Form.Item>
                <Form.Item label='命令' name='subject' rules={[{required: true}]}>
                    <Select mode="multiple" loading={commandListLoading}>
                        {commandList.map(it => <Select.Option key={it.name} value={it.name}>{it.name}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item label='过期时间' name='expires_at' rules={[{required: true}]}>
                    <DatePicker showTime />
                </Form.Item>
            </Form>
        </Modal>
    )
};


export default AddTokenModal;