import { CreateRoutePaths } from "./routePaths";

import BotForm from "ai/llm/web/BotForm";
import CreateCustomCybot from "ai/llm/web/CreateCustomCybot";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <BotForm mode="create" CreateIcon={PlusIcon} EditIcon={SyncIcon} />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_CUSTOM_CYBOT,
    element: <CreateCustomCybot />,
  },
];
