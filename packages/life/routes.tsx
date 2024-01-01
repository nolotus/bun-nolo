import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";

export enum LifeRoutePaths {
	WELCOME = "life/",
	NOTES = "life/notes",
	ALL = "life/all",
	STATISTICS = "life/statistics",
	DASHBOARD = "life/dashboard",
}

const Welcome = (
	<LazyLoadComponent
		factory={() => import("app/pages/Welcome")}
		fallback={<div>Loading Welcome...</div>}
	/>
);
const All = (
	<LazyLoadComponent
		factory={() => import("./web/All")}
		fallback={<div>Loading All...</div>}
	/>
);
const Statistics = (
	<LazyLoadComponent
		factory={() => import("./web/Statistics")}
		fallback={<div>Loading Statistics...</div>}
	/>
);
const Notes = (
	<LazyLoadComponent
		factory={() => import("./web/Notes")}
		fallback={<div>Loading Notes...</div>}
	/>
);
const Dashboard = (
	<LazyLoadComponent
		factory={() => import("./web/Dashboard")}
		fallback={<div>Loading dashboard...</div>}
	/>
);

const Calendar = (
	<LazyLoadComponent
		factory={() => import("./web/Calendar")}
		fallback={<div>Loading dashboard...</div>}
	/>
);
export const routes = {
	path: "/",
	element: <Layout />,
	children: [
		{
			path: "life",
			children: [
				{ index: true, element: Welcome },
				{ path: "all", element: All },
				{ path: "statistics", element: Statistics },
				{ path: "notes", element: Notes },
				{ path: "dashboard", element: Dashboard },
				{ path: "calendar", element: Calendar },
			],
		},
	],
};
