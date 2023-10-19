import React, { Suspense, lazy } from "react";
import Layout from "web/layout/Default";
import Login from "../pages/Login";
import Register from "../pages/Register";
export const userRoutes = [
  {
    path: "/",
    element: <Layout />,
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
