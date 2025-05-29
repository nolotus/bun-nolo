import { CreateRoutePaths } from "./routePaths";

// Web imports
import CybotForm from "ai/cybot/web/CybotForm";
import CreateCustomCybot from "ai/cybot/web/CreateCustomCybot"; // 假设暂时保留 CreateCustomCybot
import Dashboard from "./Dashboard";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE,
    element: <Dashboard />,
  },
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <CybotForm mode="create" CreateIcon={PlusIcon} EditIcon={SyncIcon} />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_CUSTOM_CYBOT,
    element: <CreateCustomCybot />, // 暂时保留原组件，可根据需求替换为 CybotForm
  },
];
