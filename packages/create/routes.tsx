// createRoutes.ts
import { CreateRoutePaths } from "./routePaths";

// Web imports
import CreateCybot from "ai/cybot/web/CreateCybot";
import CreateCustomCybot from "ai/cybot/web/CreateCustomCybot"; // 假设 CreateCustomCybot.tsx 在同一目录下
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
  {
    path: CreateRoutePaths.CREATE_CUSTOM_CYBOT,
    element: <CreateCustomCybot />,
  },
];
