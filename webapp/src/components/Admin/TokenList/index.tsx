import { Button, Dropdown, List } from "antd";
import React from "react";
import dayjs from 'dayjs';
import commandService from "../../../services/command";
import './index.module.css';
import AddTokenModal from "./AddTokenModal";

import { TokenListResponse } from "../../../services/type";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const TokenList: React.FC = () => {
    const [tokenList, setTokenList] = React.useState<TokenListResponse>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [page, setPage] = React.useState({ pageIndex: 1, pageSize: 10 });
    const [showAddTokenModal, setShowAddTokenModal] = React.useState(false);

    const refresh = React.useCallback(() => {
        setLoading(true);
        commandService.getTokenList(page.pageIndex, page.pageSize).then(tokenList => {
            setTokenList(tokenList);
            setLoading(false);
        });
    }, [page, setLoading]);

    React.useEffect(() => {
        refresh(); 
    }, [refresh]);

    return (
        <>
            <AddTokenModal open={showAddTokenModal} onOpenChange={setShowAddTokenModal} onChange={refresh} />
            <List
                header={(
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: '1' }}>Token管理</div>
                        <div><Button onClick={() => setShowAddTokenModal(true)}><PlusOutlined />添加Token</Button></div>
                    </div>
                )}
                dataSource={tokenList?.items}
                loading={loading}
                pagination={{
                    pageSize: page.pageSize,
                    current: page.pageIndex,
                    onChange: (pageIndex, pageSize) => setPage({ pageIndex, pageSize })
                }}
                renderItem={item => {
                    return (
                        <List.Item 
                            actions={[
                                <Dropdown trigger={['click']} menu={{items: [{label: 'Delete', key: 'delete'}]}}>
                                    <Button type="link" style={{alignSelf: 'baseline'}}><DeleteOutlined />刪除</Button>
                                </Dropdown>
                            ]}
                        >
                            <div>
                                <p>ID: {item.id}</p>
                                <p>Token: {item.jwt_token}</p>
                                <p>Name: {item.name}</p>
                                <p>Subject: {item.subject}</p>
                                <p>IssuseAt: {dayjs(item.issue_at*1000).format('YYYY-MM-DD HH:mm:ss')}</p>
                                <p>ExpiresAt: {dayjs(item.expires_at*1000).format('YYYY-MM-DD HH:mm:ss')}</p>
                            </div>
                        </List.Item>
                    )
                }}
            />
        </>
    )
}


export default TokenList;