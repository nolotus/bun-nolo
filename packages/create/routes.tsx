// createRoutes.tsx
import { lazy, Suspense } from "react";
import { CreateRoutePaths } from "./routePaths";

const AgentForm = lazy(() => import("ai/llm/web/AgentForm"));
const CreateCustomCybot = lazy(() => import("ai/llm/web/CreateCustomCybot"));

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <Suspense fallback={null}>
        <AgentForm mode="create" />
      </Suspense>
    ),
  },
  {
    path: CreateRoutePaths.CREATE_CUSTOM_CYBOT,
    element: (
      <Suspense fallback={null}>
        <CreateCustomCybot />
      </Suspense>
    ),
  },
];
