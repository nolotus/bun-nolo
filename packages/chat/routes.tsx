import React, { Suspense, lazy } from "react";
import Full from "render/layout/Full";
const ChatPage = lazy(() => import("./chat/ChatPage"));

export const routes = {
	path: "/",
	element: <Full />,
	children: [
		{
			path: "chat",
			element: (
				<Suspense fallback={<div> loading chat</div>}>
					<ChatPage />
				</Suspense>
			),
		},
	],
};
