import CreateCybot from "ai/cybot/CreateCybot";
import { createLazyRoute } from "web/createLazyRoute";
import { CreateRoutePaths } from "./routePaths";

export const createRoutes = [
  createLazyRoute(CreateRoutePaths.CREATE, () => import("./Dashboard")),
  createLazyRoute(
    CreateRoutePaths.CREATE_PAGE,
    () => import("render/page/CreatePage"),
  ),

  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: <CreateCybot />,
  },
  createLazyRoute(
    CreateRoutePaths.CREATE_PROMPT,
    () => import("ai/prompt/Create"),
  ),
];
