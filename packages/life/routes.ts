import { createLazyRoute } from "render/web/createLazyRoute";

export const lifeRoutes = [
  createLazyRoute("/life", () => import("life/web/Usage")),
  createLazyRoute("/life/usage", () => import("life/web/Usage")),
  createLazyRoute("life/users", () => import("auth/web/UsersPage")),
];
