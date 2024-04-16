import React from "react";
import styles from "./index.module.css";
import { Link, Outlet } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
import { Layout } from "antd";


const BasicLayout: React.FC = () => {
    return (
        <Layout className={styles.basicLayout}>
            <Header>
                <div className={styles.title}>HttpRun</div>
            </Header>
            <div className={styles.nav}>
                <Link to="/admin">命令列表</Link>
                <Link to="/admin/token">Token管理</Link>
                <Link to="/admin/accesslog">访问日志</Link>
            </div>
            <React.Suspense fallback='loading...'>
                <Outlet />
            </React.Suspense>
        </Layout>
    )
}

export default BasicLayout;