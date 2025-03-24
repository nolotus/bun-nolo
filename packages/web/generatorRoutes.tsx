import { Suspense, lazy } from "react";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "setting/routes";
import { lifeRoutes } from "life/routes";
const Page = lazy(() => import("render/page/PageIndex"));

const hostRoutesMap = {
  // "nolotus.test": yujierRoutes,
  // "nolotus.xyz": yujierRoutes,
  // "nolotus.local": nolotusRoutes,
  // "nolotus.com": nolotusRoutes,
  // "kr.nolotus.com": nolotusRoutes,
  // "nolotus.top": uniqeicRoutes,
};

export const generatorRoutes = (host: string) => {
  const hostRoutes = hostRoutesMap[host];

  // const pluginRoutes = [xlsxRoute, ...chatRoutes];
  const pluginRoutes = [...chatRoutes];

  const routes = [...hostRoutes, ...pluginRoutes];
  return routes;
};

export const commonRoutes = [
  ...authRoutes,
  ...createRoutes,
  settingRoutes,
  ...lifeRoutes,
  // 动态页面放最后
  {
    path: ":pageId",
    element: (
      <Suspense>
        <Page />
      </Suspense>
    ),
  },
];
