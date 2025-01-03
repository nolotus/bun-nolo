import { CreateRoutePaths } from "./routePaths";

//web imports
import CreateCybot from "ai/cybot/CreateCybot";
import { createLazyRoute } from "web/createLazyRoute";

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
