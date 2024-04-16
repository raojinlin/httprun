import React from "react";
import styles from './index.module.css';
import { Form, Modal, Input, Typography, Button, List, Select, Checkbox, Radio, message } from "antd";
import { EditorProps } from './type'
import { CommandItem, ParamDefine } from "../../../services/type";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import commandService from "../../../services/command";

const Editor: React.FC<EditorProps> = ({ open, onClose, command, onChange }) => {
    const [value, setValue] = React.useState<CommandItem>(command || {command: {command: '', params: [], env: []}});
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        setValue(command || {command: {command: '', params: [], env: []}});
    }, [command]);

    let title = '添加命令';
    if (command && command.name) {
        title = `编辑命令 - ${title}`
    }

    const handleParamAdd = React.useCallback(() => {
        const newValue: CommandItem = {...(value || {})};
        if (!newValue.command) {
            newValue.command = {
                command: '',
                params: [],
                env: [],
            };
        }

        newValue.command.params.push({name: '', description: '', defaultValue: '', required: true, type: 'string'});
        setValue(newValue);
    }, [value]);

    const handleEnvAdd = React.useCallback(() => {
        const newValue: CommandItem = {...(value || {})};
        if (!newValue.command) {
            newValue.command = {
                command: '',
                params: [],
                env: [],
            };
        }

        if (!newValue.command.env) {
            newValue.command.env = [];
        }
        newValue.command.env.push({name: '', value: ''});
        setValue(newValue);
    }, [value]);

    const handleEnvRemove = React.useCallback((i: number) => {
        const newValue: CommandItem = {...(value || {})};
        newValue.command.env.splice(i, 1);
        setValue(newValue);
    }, [value]);

    const handleParamRemove = React.useCallback((i: number) => {
        const newValue: CommandItem = {...(value || {})};
        newValue.command.params.splice(i, 1);
        setValue(newValue);
    }, [value]);


    const handleParamItemChange = React.useCallback((i: number, name: keyof ParamDefine, val: never) => {
        const newValue: CommandItem = {...(value || {})};
        newValue.command.params[i][name] = val;
        setValue(newValue);
    }, [value]);

    const handleEnvChange = React.useCallback((i: number, type: 'name'|'value', val: string) => {
        const newValue: CommandItem = {...(value || {})};
        newValue.command.env[i][type] = val;
        setValue(newValue);
    }, [value]);

    const handleCreateCommand = React.useCallback(() => {
        form.validateFields().then(() => {
            setLoading(true);
            const req = {...value};
            const val = form.getFieldsValue();
            req.name = val.name;
            req.description = val.description;
            req.command.command = val.command;
            req.status = 0;
            req.path = `/api/run/${req.name}`;
            commandService.create(req).then(r => {
                message.success('创建成功！');
                setLoading(false);
                if (onChange) onChange();
            }).catch((err) => {
                setLoading(false);
                message.error('创建失败: ' + err.message);
                setLoading(false);
            });
            if (onClose) onClose();
        }).catch((err) => {
            message.warning('Invalid: ' + err.message)
        });
    }, [form, value, onChange, onClose]);

    return (
        <Modal open={open} title={title} onCancel={onClose} okText='创建' cancelText='取消' okButtonProps={{loading, onClick: handleCreateCommand}}>
            <Form form={form} initialValues={{name: value?.name, description: value?.description, command: value?.command?.command}}>
                <Form.Item label="名称" name='name' rules={[{required: true}]}>
                    <Input type="text" />
                </Form.Item>
                <Form.Item label="描述" name="description" rules={[{required: true}]}>
                    <Input type="text" />
                </Form.Item>
                <Form.Item label="内容" name="command" rules={[{required: true}]}>
                    <Input.TextArea />
                </Form.Item>
            </Form>
            <Typography style={{fontSize: 15}}>参数列表</Typography>
            <List>
                {(value?.command?.params || []).map((param, i) => {
                    return (
                        <List.Item key={i}>
                            <div style={{width: 400}}>
                                <div className={styles.inputRow}>
                                    <span className={styles.itemName}>名称：</span>
                                    <Input 
                                        onChange={e => handleParamItemChange(i, 'name', e.target.value as never)} 
                                        type="text" 
                                        value={param.name} 
                                    />
                                </div>
                                <div className={styles.inputRow}>
                                    <span className={styles.itemName}>描述：</span>
                                    <Input.TextArea value={param.description} onChange={e => handleParamItemChange(i, 'description', e.target.value as never)} />
                                </div>
                                <div className={styles.inputRow}>
                                    <span className={styles.itemName}>数据类型：</span>
                                    <Select 
                                        value={param.type} 
                                        onChange={e => handleParamItemChange(i, 'type', e as never)}
                                        options={[
                                            {label: '字符串', value: 'string'}, 
                                            {label: '整数', value: 'int'}, 
                                            {label: '布尔', value: 'bool'}
                                        ]}
                                    />
                                </div>
                                <div className={styles.inputRow}>
                                    <span className={styles.itemName}>默认值：</span>
                                    {param.type === 'bool' 
                                    ? (
                                        <Radio.Group 
                                            name="defaultvalue" 
                                            value={param.defaultValue ? 'true' : 'false'} 
                                            onChange={e => handleParamItemChange(i, 'defaultValue', (e.target.value === 'true' ? true : false) as never)}
                                        >
                                        <Radio value='true'>是</Radio><Radio value='false'>否</Radio>
                                      </Radio.Group>
                                    ): <Input 
                                        type="text" 
                                        value={param.defaultValue as string} 
                                        onChange={e => handleParamItemChange(i, 'defaultValue', e.target.value as never)} 
                                    />}
                                </div>
                                <div className={styles.inputRow}>
                                    <span className={styles.itemName}>必填：</span>
                                    <Checkbox 
                                        checked={param.required} 
                                        onChange={e => handleParamItemChange(i, 'required', e.target.checked as never)}
                                    >
                                        是
                                    </Checkbox>
                                </div>
                            </div>
                            <div style={{alignSelf: 'baseline'}}>
                                <CloseOutlined className={styles.closeIcon} onClick={() => handleParamRemove(i)} />
                            </div>
                        </List.Item>
                    );
                })}
                <List.Item>
                    <Button type='link' onClick={() => handleParamAdd()}><PlusOutlined />添加参数</Button>
                </List.Item>
            </List>
            <Typography style={{fontSize: 15}}>环境变量</Typography>
            <List>
                {(value?.command?.env || []).map((env, i) => {
                    return (
                        <List.Item key={i}>
                            <div className={styles.inputRow}>
                                <Input 
                                    style={{width: 200, marginRight: 5}} 
                                    type='text' 
                                    placeholder="NAME" 
                                    value={env.name} 
                                    onChange={e => handleEnvChange(i, 'name', e.target.value)}
                                />
                                <Input 
                                    style={{width: 200}} 
                                    type='text' 
                                    placeholder="VALUE" 
                                    value={env.value} 
                                    onChange={e => handleEnvChange(i, 'value', e.target.value)}
                                />
                            </div>
                            <div style={{alignSelf: 'center'}}>
                                <CloseOutlined onClick={() => handleEnvRemove(i)} className={styles.closeIcon} />
                            </div>
                        </List.Item>
                    )
                })}
                <List.Item>
                    <Button type='link' onClick={handleEnvAdd}>
                        <PlusOutlined />
                        添加环境变量
                    </Button>
                </List.Item>
            </List>
        </Modal>
    )
};


export default Editor;