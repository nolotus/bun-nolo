import React, { Suspense } from "react";

// import { routes as UIRoutes } from "../ui/route";
// import NoMatch from "../ui/NoMatch";

// import { userRoutes } from "../domain/user/client/route";
// import { settingRoutes } from "../domain/setting/route";
// import { lifeRoutes } from "../domain/life/route";
// import { createRoutes } from "../domain/create/route";

// import { xlsxRoute } from "../domain/xlsx/route";
// import { chatRoutes } from "../domain/chat/route";

// import { routes as uniqeicRoutes } from "../third/uniqeic/route";
// import { routes as nolotusRoutes } from "../third/nolotus/route";
// import { routes as yujierRoutes } from "../third/yujier/route";
import Home from "./pages/Home";
import Layout from "./Layout";
const Page = () => {
  return <div>id</div>;
};
export const nolotusRoutes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<>样式加载中</>}>
        <Layout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Home /> },
      {
        path: "/:id",
        element: (
          <Suspense fallback={<>...</>}>
            <Page />
          </Suspense>
        ),
      },
    ],
  },
];

const hostRoutesMap = {
  // "nolotus.test": yujierRoutes,
  // "nolotus.xyz": yujierRoutes,
  "nolotus.local": nolotusRoutes,
  // "nolotus.com": nolotusRoutes,
  // "nolotus.top": uniqeicRoutes,
};

export const generatorRoutes = (host) => {
  let hostRoutes = hostRoutesMap[host] || nolotusRoutes;

  // const pluginRoutes = [xlsxRoute, ...chatRoutes];
  // const commonRoutes = [
  //   ...UIRoutes,
  //   ...userRoutes,
  //   ...settingRoutes,
  //   ...lifeRoutes,
  //   ...createRoutes,
  //   { path: "*", element: <NoMatch /> },
  // ];
  // const routes = [...hostRoutes, ...pluginRoutes, ...commonRoutes];
  const routes = [...hostRoutes];

  return routes;
};
