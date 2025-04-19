// routes.jsx
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { Suspense, lazy } from "react";
import MainLayout from "render/layout/MainLayout";
import { commonRoutes } from "./generatorRoutes";
import { spaceRoutes } from "create/space/routes";
const PricePage = lazy(() => import("app/pages/Price"));
const Models = lazy(() => import("ai/cybot/web/Models"));

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
        path: "pricing",
        element: <PricePage />,
      },
      spaceRoutes,
      {
        path: "explore",
        element: (
          <Suspense>
            <Models />
          </Suspense>
        ),
      },
    ],
  },
];
