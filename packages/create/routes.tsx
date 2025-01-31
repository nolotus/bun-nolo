import { CreateRoutePaths } from "./routePaths";

//web imports
import CreateCybot from "ai/cybot/web/CreateCybot";
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
];
