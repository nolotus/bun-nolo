import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";

export enum LifeRoutePaths {
	WELCOME = "life/",
	ALL = "life/all",
	STATISTICS = "life/statistics",
	NOTES = "life/notes",
}

const Welcome = (
	<LazyLoadComponent
		factory={() => import("app/pages/Welcome")}
		fallback={<div>Loading Welcome...</div>}
	/>
);
const All = (
	<LazyLoadComponent
		factory={() => import("life/pages/All")}
		fallback={<div>Loading All...</div>}
	/>
);
const Statistics = (
	<LazyLoadComponent
		factory={() => import("life/pages/Statistics")}
		fallback={<div>Loading Statistics...</div>}
	/>
);
const Notes = (
	<LazyLoadComponent
		factory={() => import("life/pages/Notes")}
		fallback={<div>Loading Notes...</div>}
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
			],
		},
	],
};
