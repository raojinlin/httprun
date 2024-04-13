import React from "react";
import { Alert, Button, Checkbox, Form, Input, List, Modal, Typography, message } from "antd";
import { EditorProps } from "./type";
import FormItem from "antd/es/form/FormItem";
import commandService from "../../../services/command";
import { CommandOutputResponse, Param } from "../../../services/type";


const Editor: React.FC<EditorProps> = ({ open, command, onClose }) => {
    const [form] = Form.useForm();
    const [running, setRunning] = React.useState(false);
    const [result, setResult] = React.useState<CommandOutputResponse>();

    const handleRun = React.useCallback(() => {
        console.log(form.getFieldsValue())
        form.validateFields().then(() => {
            setRunning(true);
            const values = form.getFieldsValue();
            const params: Param[] = [];
            Object.keys(values).forEach(key => {
                let val = values[key];
                if (['true', 'false'].includes(val)) {
                    val = val === 'true';
                }
                params.push({name: key, value: val});
            });
            commandService.run(command.name, params, []).then((r) => {
                setRunning(false);
                setResult(r);

                if (!r.error) {
                    message.success("执行成功");
                } else {
                    message.error(r.stderr || ("执行失败: " + r.error));
                }
            }).catch(() => {
                setRunning(false);
                message.error("执行失败");
            });
        })
        .catch(err => {
            message.warning('请填写参数')
        })
    }, [command, form]);

    const initialValues = React.useMemo(() => {
        const val: Record<any, any> = {};
        command.command.params.forEach(p => {
            val[p.name] = p.defaultValue;
        });
        return val;
    }, [command]);
    return (
        <Modal open={open} title={'编辑命令 - ' + command.name} onCancel={onClose}>
            <Typography style={{marginBottom: '15px', color: 'rgb(0, 0, 0, 0.45)'}}>{command.description}</Typography>
            <Typography>参数列表</Typography>
            <Form form={form} onSubmitCapture={handleRun} initialValues={initialValues}>
                <List 
                    dataSource={command.command.params} 
                    renderItem={item => {
                        return (
                            <List.Item>
                                <List.Item.Meta 
                                    title={<><span style={{marginRight: '3px', color: 'red'}}>{item.required ? '*' : ''}</span> {item.name}</>} 
                                    description={item.description} 
                                />
                                <FormItem
                                    name={item.name}
                                    rules={[{required: item.required}]}
                                    valuePropName={item.type === 'bool' ? 'checked' : 'value'}
                                >
                                    {item.type === 'bool' ? <Checkbox /> : <Input type="text" />}
                                </FormItem>
                            </List.Item>
                        )
                    }}
                />
                <FormItem>
                    <Button loading={running} htmlType="submit">运行命令</Button>
                </FormItem>
            </Form>
            <div>
                {result?.error ? <Alert type="error" message={`${result.error}. ${result.stderr}`} /> : null}
                <pre style={{maxHeight: '500px', overflow: 'auto'}}>{result?.stdout}</pre>
            </div>
        </Modal>
    );
}


export default Editor;