import { createLazyRoute } from "web/createLazyRoute";

export const lifeRoutes = [
  createLazyRoute("/life/usage", () => import("life/web/Usage")),
  createLazyRoute("/life", () => import("life/web/Database")),
];
