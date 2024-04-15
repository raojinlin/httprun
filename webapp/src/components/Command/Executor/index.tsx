import React from "react";
import { Alert, Checkbox, Form, Input, List, Modal, Typography, message } from "antd";
import { ExecutorProps } from "./type";
import FormItem from "antd/es/form/FormItem";
import commandService from "../../../services/command";
import { CommandOutputResponse, Param } from "../../../services/type";


const Executor: React.FC<ExecutorProps> = ({ open, command, onClose }) => {
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
        <Modal
            open={open} 
            title={'运行命令 - ' + command.name} 
            onCancel={onClose} 
            cancelText={'关闭'}
            okText={<>运行</>}
            okButtonProps={{onClick: handleRun, loading: running}}
        >
            <Typography style={{marginBottom: '15px', color: 'rgb(0, 0, 0, 0.45)'}}>{command.description}</Typography>
            <Typography>参数列表</Typography>
            <Form form={form} initialValues={initialValues}>
                <List>
                    {(command.command.params).map(item => {
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
                                    style={{alignSelf: 'baseline'}}
                                >
                                    {item.type === 'bool' ? <Checkbox /> : <Input type="text" />}
                                </FormItem>
                            </List.Item>
                        )
                    })}
                </List>
            </Form>
            <Typography>环境变量</Typography>
            <List>
                {!command.command.env || !command.command.env.length ? <span>None</span> : null}
                {(command.command.env || []).map(env => {
                    return <List.Item key={env.name}><List.Item.Meta title={env.name} description={env.value} /></List.Item>
                })}
            </List>
            <div>
                {result?.error ? <Alert type="error" message={`${result.error}. ${result.stderr}`} /> : null}
                <pre style={{maxHeight: '300px', overflow: 'auto'}}>{result?.stdout}</pre>
            </div>
        </Modal>
    );
}


export default Executor;