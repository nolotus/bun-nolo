import React, { Suspense, lazy } from "react";

const Layout = lazy(() => import("web/Layout"));
import Login from "../pages/Login";
import Register from "../pages/Register";
export const userRoutes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<>样式加载中</>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
];
