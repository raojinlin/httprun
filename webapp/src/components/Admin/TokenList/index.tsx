import { Button, List } from "antd";
import React from "react";
import commandService from "../../../services/command";

import { TokenListResponse } from "../../../services/type";
import { PlusOutlined } from "@ant-design/icons";
import AddTokenModal from "./AddTokenModal";

const TokenList: React.FC = () => {
    const [tokenList, setTokenList] = React.useState<TokenListResponse>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [page, setPage] = React.useState({ pageIndex: 1, pageSize: 10 });

    React.useEffect(() => {
        setLoading(true);
        commandService.getTokenList(page.pageIndex, page.pageSize).then(tokenList => {
            setTokenList(tokenList);
            setLoading(false);
        });
    }, [page, setLoading]);

    return (
        <>
            <AddTokenModal />
            <List
                header={(<div style={{ display: 'flex' }}><div style={{ flex: '1' }}>Token管理</div><div><Button><PlusOutlined />添加Token</Button></div></div>)}
                dataSource={tokenList?.items}
                loading={loading}
                pagination={{
                    pageSize: page.pageSize,
                    current: page.pageIndex,
                    onChange: (pageIndex, pageSize) => setPage({ pageIndex, pageSize })
                }}
                renderItem={item => {
                    return (
                        <List.Item>
                            <div>
                                <p>ID: {item.id}</p>
                                <p>Token: {item.jwt_token}</p>
                                <p>Name: {item.name}</p>
                                <p>Subject: {item.subject}</p>
                                <p>IssuseAt: {item.issuse_at}</p>
                                <p>ExpiresAt: {item.expires_at}</p>
                            </div>
                        </List.Item>
                    )
                }}
            />
        </>
    )
}


export default TokenList;