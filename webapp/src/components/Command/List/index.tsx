import React from "react";
import Editor from "../Editor";
import styles from './index.module.css';
import Executor from "../Executor";
import commandService from "../../../services/command";

import { CommandListProps } from "./type";
import { Button, Dropdown, List, message } from "antd";
import { CommandItem } from "../../../services/type";
import { DeleteOutlined, EditOutlined, NumberOutlined, PlusOutlined } from "@ant-design/icons";

const CommandList: React.FC<CommandListProps> = ({ admin }) => {
    const [items, setItems] = React.useState<CommandItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [currentCommand, setCurrentCommand] = React.useState<CommandItem|null>();
    const [editCommand, setEditCommand] = React.useState<CommandItem|null|{}>();

    const refresh = React.useCallback(() => {
        setLoading(true);
        if (!admin) {
            commandService.getUserCommandList().then(items => {
                setItems(items);
                setLoading(false);
            });
        }
        commandService.getCommandList().then(items => {
            setItems(items);
            setLoading(false);
        });
    }, [admin]);

    React.useEffect(() => {
        refresh();
    }, []);

    const handleDelete = React.useCallback((name: string) => {
        message.loading("正在删除")
        commandService.delete([name]).then(r => {
            message.success('已删除');
            message.destroy();
            refresh();
        })
    }, [refresh]);

    return (
        <div className={styles.list}>
            {currentCommand ? 
                <Executor action="edit" onClose={() => setCurrentCommand(null)} open command={currentCommand} /> : 
                null
            }
            {editCommand ? <Editor open command={editCommand as CommandItem} onClose={() => setEditCommand(null)} onChange={refresh} /> : null}
            <List
                header={(
                    <div style={{display: 'flex'}}>
                        <div style={{flex: '1 auto'}}>命令列表</div>
                        <div><Button onClick={() => setEditCommand({})}><PlusOutlined /> 添加命令</Button></div>
                    </div>
                )}
                loading={loading}
                dataSource={items}
                renderItem={item => {
                    const actions = [<Button type='link' onClick={() => setCurrentCommand(item)}><NumberOutlined />运行命令</Button>];
                    if (admin) {
                        actions.push((
                            <Dropdown 
                                trigger={['click']} 
                                menu={{items: [{label: '确认删除', key: 'confirm', onClick: () => handleDelete(item.name)}]}}
                            >
                                <Button type='link'>
                                    <span><DeleteOutlined />删除命令</span>
                                </Button>
                            </Dropdown>
                        ))
                        actions.push(<Button onClick={() => setEditCommand(item)} type='link'><EditOutlined />编辑命令</Button>)
                    }
                    return (
                        <List.Item actions={actions}>
                            <List.Item.Meta title={item.name} description={item.description} />
                        </List.Item>
                    )
                }}
            />
        </div>
    )
}


export default CommandList;