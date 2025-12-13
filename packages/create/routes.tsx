// createRoutes.tsx
import { lazy, Suspense } from "react";
import { CreateRoutePaths } from "./routePaths";

const AgentForm = lazy(() => import("ai/agent/web/AgentForm"));

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <Suspense fallback={null}>
        <AgentForm mode="create" />
      </Suspense>
    ),
  },
];
