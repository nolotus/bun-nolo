import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import React, { Suspense, lazy } from "react";
import MainLayout from "render/layout/MainLayout";

import { SurfTip } from "./SurfTip";
import { commonRoutes } from "./generatorRoutes";

const Page = lazy(() => import("render/page/PageIndex"));

const PricePage = lazy(() => import("app/pages/Price"));

export const routes = (currentUser: any) => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...commonRoutes,

      {
        index: true,
        element: <Home />,
      },
      {
        path: "lab",
        element: <Lab />,
      },
      {
        path: "price",
        element: <PricePage />,
      },
      { path: "surfing-safety-tips", element: <SurfTip /> },
      {
        path: ":pageId",
        element: (
          <Suspense>
            <Page />
          </Suspense>
        ),
      },
    ],
  },
];

