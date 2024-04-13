import React from "react";
import styles from './index.module.css';
import { CommandListProps } from "./type";
import { Button, List } from "antd";
import { CommandItem } from "../../../services/type";
import commandService from "../../../services/command";
import Editor from "../Editor";

const CommandList: React.FC<CommandListProps> = () => {
    const [items, setItems] = React.useState<CommandItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [currentCommand, setCurrentCommand] = React.useState<CommandItem|null>();

    React.useEffect(() => {
        setLoading(true);
        commandService.getCommandList().then(items => {
            setItems(items);
            setLoading(false);
        })
    }, []);
    return (
        <div className={styles.list}>
            <h1>HTTPRUN</h1>
            {currentCommand ? <Editor action="edit" onClose={() => setCurrentCommand(null)} open command={currentCommand} /> : null}
            <List
                header='命令列表'
                loading={loading}
                dataSource={items}
                renderItem={item => {
                    return (
                        <List.Item actions={[<Button type='link' onClick={() => setCurrentCommand(item)}>运行命令</Button>]}>
                            <List.Item.Meta title={item.name} description={item.description} />
                        </List.Item>
                    )
                }}
            />
        </div>
    )
}


export default CommandList;