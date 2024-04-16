import React from "react";
import { AccessLogListResponse } from "../../../services/type";
import commandService from "../../../services/command";
import { List, Spin } from "antd";

const AccessLog: React.FC = (props) => {
    const [data, setData] = React.useState<AccessLogListResponse>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [page, setPage] = React.useState({ pageIndex: 1, pageSize: 10 });

    React.useEffect(() => {
        setLoading(true);
        commandService.accesslog(page.pageIndex, page.pageSize).then(response => {
            setLoading(false);
            setData(response);
        })
    }, [page]);

    return (
        <List
            header={'Access Log'}
            loading={loading}
            pagination={{ pageSize: page.pageSize, current: page.pageIndex, total: data?.total, onChange: (page, pageSize) => setPage({ pageIndex: page, pageSize }) }}
            dataSource={data?.items}
            renderItem={item => {
                return (
                    <List.Item>
                        <div>
                            <p>ID: {item.id}</p>
                            <p>Path: {item.path}</p>
                            <p>IP: {item.ip}</p>
                            <p>Token: {item.token_id}</p>
                            <p>Request: {item.request}</p>
                            <p>Response: {item.response}</p>
                            <p>Time: {item.created_at}</p>
                        </div>
                    </List.Item>
                )
            }}
        />
    );
}


export default AccessLog;