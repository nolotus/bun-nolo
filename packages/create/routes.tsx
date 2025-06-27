import { CreateRoutePaths } from "./routePaths";

import AgentForm from "ai/llm/web/AgentForm";
import CreateCustomCybot from "ai/llm/web/CreateCustomCybot";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <AgentForm mode="create" CreateIcon={PlusIcon} EditIcon={SyncIcon} />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_CUSTOM_CYBOT,
    element: <CreateCustomCybot />,
  },
];
