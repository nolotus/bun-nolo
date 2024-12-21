import { createLazyRoute } from "web/createLazyRoute";

export const lifeRoutes = [
	createLazyRoute("/life", () => import("life/web/Database")),
	createLazyRoute("/life/statistics", () => import("life/web/Statistics")),
	createLazyRoute("/life/usage", () => import("life/web/Usage")),

];
