import React from "react";
import styles from "./index.module.css";
import { Outlet } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
import { Layout } from "antd";


const BasicLayout: React.FC = () => {
    return (
        <Layout className={styles.basicLayout}>
            <Header>
                <div className={styles.title}>HttpRun</div>
            </Header>
            <Outlet />
        </Layout>
    )
}

export default BasicLayout;