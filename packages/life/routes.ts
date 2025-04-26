import { createLazyRoute } from "web/createLazyRoute";

export const lifeRoutes = [
  createLazyRoute("/life", () => import("life/web/Usage")),
  createLazyRoute("/life/usage", () => import("life/web/Usage")),
  createLazyRoute("life/users", () => import("auth/web/UsersPage")),
];
