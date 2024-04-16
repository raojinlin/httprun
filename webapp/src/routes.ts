import React from "react";
import { createBrowserRouter  } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: '/',
        Component: React.lazy(() => import('./layouts/BasicLayout')),
        children: [
            {
                path: '',
                Component: React.lazy(() => import('./components/Command/List')),
            },
            {
                path: '/admin',
                Component: React.lazy(() => import('./components/Admin')),
            },
            {
                path: '/admin/accesslog',
                Component: React.lazy(() => import('./components/Admin/AccessLog')),
            },
            {
                path: '/admin/token',
                Component: React.lazy(() => import('./components/Admin/TokenList')),
            }
        ]
    }
]);


export default router;