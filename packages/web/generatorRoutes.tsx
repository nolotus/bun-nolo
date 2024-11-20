import React, { Suspense, lazy } from "react";
import { chatRoutes } from "chat/route";

// import { routes as UIRoutes } from "../ui/route";

import { settingRoutes } from "setting/route";
// import { lifeRoutes } from "../domain/life/route";
// import { createRoutes } from "../domain/create/route";

// import { routes as nolotusRoutes } from "../third/nolotus/route";

const hostRoutesMap = {
  // "nolotus.test": yujierRoutes,
  // "nolotus.xyz": yujierRoutes,
  "nolotus.local": nolotusRoutes,
  "nolotus.com": nolotusRoutes,
  "kr.nolotus.com": nolotusRoutes,
  // "nolotus.top": uniqeicRoutes,
};

export const generatorRoutes = (host: string) => {
  let hostRoutes = hostRoutesMap[host];

  // const pluginRoutes = [xlsxRoute, ...chatRoutes];
  const pluginRoutes = [...chatRoutes];

  // const commonRoutes = [
  //   ...UIRoutes,
  //   ...userRoutes,
  //   ...settingRoutes,
  //   ...lifeRoutes,
  //   ...createRoutes,
  // ];
  const routes = [...hostRoutes, ...pluginRoutes];
  return routes;
};
