import React from "react";
import styles from './index.module.css';
import Executor from "../Executor";
import commandService from "../../../services/command";

import { CommandListProps } from "./type";
import { Button, List } from "antd";
import { CommandItem } from "../../../services/type";
import { PlusOutlined } from "@ant-design/icons";

const CommandList: React.FC<CommandListProps> = ({ admin }) => {
    const [items, setItems] = React.useState<CommandItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [currentCommand, setCurrentCommand] = React.useState<CommandItem|null>();

    React.useEffect(() => {
        setLoading(true);
        commandService.getCommandList().then(items => {
            setItems(items);
            setLoading(false);
        });
    }, []);
    return (
        <div className={styles.list}>
            {currentCommand ? 
                <Executor action="edit" onClose={() => setCurrentCommand(null)} open command={currentCommand} /> : 
                null
            }
            <List
                header={(
                    <div style={{display: 'flex'}}>
                        <div style={{flex: '1 auto'}}>命令列表</div>
                        <div><Button><PlusOutlined /> 添加命令</Button></div>
                    </div>
                )}
                loading={loading}
                dataSource={items}
                renderItem={item => {
                    const actions = [<Button type='link' onClick={() => setCurrentCommand(item)}>运行命令</Button>];
                    if (admin) {
                        actions.push(<Button type='primary'>删除命令</Button>)
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