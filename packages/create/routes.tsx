import { CreateRoutePaths } from "./routePaths";

//web imports
import CreateCybot from "ai/cybot/CreateCybot";
import { createLazyRoute } from "web/createLazyRoute";
import Dashboard from "./Dashboard";
export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE,
    element: <Dashboard />,
  },
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: <CreateCybot />,
  },
  createLazyRoute(
    CreateRoutePaths.CREATE_PROMPT,
    () => import("ai/prompt/Create")
  ),
];
