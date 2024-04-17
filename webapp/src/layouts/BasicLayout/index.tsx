import React from "react";
import styles from "./index.module.css";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
import { Layout } from "antd";
import commandService from "../../services/command";
import Token from "../../components/Token";


const menus = [
    {
        name: '命令管理',
        url: '/admin'
    },
    {
        name: 'Token管理',
        url: '/admin/token'
    },
    {
        name: '访问日志',
        url: '/admin/accesslog'
    }
]

const BasicLayout: React.FC = () => {
    const location = useLocation();
    const [showTokenSetting, setShowTokenSetting] = React.useState(false);
    React.useEffect(() => {
        commandService.validToken().catch(() => {
            setShowTokenSetting(true);
        });
    }, []);
    return (
        <Layout className={styles.basicLayout}>
            <Token open={showTokenSetting} onOpenChange={setShowTokenSetting} onOk={() => window.location.reload()} />
            <Header>
                <div className={styles.title}>HttpRun</div>
            </Header>
            <div className={styles.nav}>
                {menus.map(it => <Link to={it.url} className={location.pathname === it.url ? styles.activeNav : ''} key={it.url}>{it.name}</Link>)}
            </div>
            <React.Suspense fallback='loading...'>
                <Outlet />
            </React.Suspense>
        </Layout>
    )
}

export default BasicLayout;