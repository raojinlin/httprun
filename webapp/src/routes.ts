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
                Component: React.lazy(() => import('./components/Admin'))
            }
        ]
    }
]);


export default router;