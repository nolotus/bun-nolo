import CreateCybot from "ai/cybot/CreateCybot";
import { createLazyRoute } from "web/createLazyRoute";
export enum CreateRoutePaths {
  CREATE = "create",
  CREATE_PAGE = "create/page",
  CREATE_CYBOT = "create/cybot",
  CREATE_PROMPT = "create/prompt",
}

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
