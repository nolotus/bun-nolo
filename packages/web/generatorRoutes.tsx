import { authRoutes } from "auth/client/routes";
import { createRoutes } from "create/routes";
import React, { Suspense, lazy } from "react";
import { settingRoutes } from "setting/routes";

// import { routes as UIRoutes } from "../ui/route";

// import { lifeRoutes } from "../domain/life/route";
// import { createRoutes } from "../domain/create/route";

// import { routes as nolotusRoutes } from "../third/nolotus/route";

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

export const commonRoutes = [...authRoutes, ...createRoutes, settingRoutes];
