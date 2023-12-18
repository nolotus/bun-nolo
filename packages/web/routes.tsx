import { authRoutes } from "auth/client/routes";
import { routes as chatRoutes } from "chat/routes";
import { createRoutes } from "create/routes";
import { routes as lifeRoutes } from "life/routes";
import React, { Suspense, lazy } from "react";
import Default from "render/layout/Default";
import { routes as settingRoutes } from "setting/routes";

import { SurfTip } from "./SurfTip";
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import Spots from "app/pages/Spots";
const Page = lazy(() => import("render/page/PageIndex"));

export const routes = (currentUser) => [
	{
		path: "/",
		element: <Default />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "lab",
				element: <Lab />,
			},
			{
				path: "spots",
				element: (
					<Suspense fallback={<div>loading spots</div>}>
						<Spots />
					</Suspense>
				),
			},
			...authRoutes,
			...createRoutes,

			{
				path: "price",
				element: (
					<Page
						id={
							"000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-v9ziDvBB6UkWgFM_S2PV6"
						}
					/>
				),
			},
			{ path: "surfing-safety-tips", element: <SurfTip /> },
		],
	},
	settingRoutes,
	chatRoutes,
	lifeRoutes,
	{
		path: ":pageId",
		element: (
			<Suspense fallback={<div>loading Page</div>}>
				<Page />
			</Suspense>
		),
	},
];
