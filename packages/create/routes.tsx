import React from "react";
import { createLazyRoute } from "web/createLazyRoute";

export enum CreateRoutePaths {
  CREATE = "create",
  CREATE_PAGE = "create/page",
  CREATE_CYBOT = "create/cybot",
  CREATE_PROMPT = "create/prompt",
}

export const createRoutes = [
  createLazyRoute(CreateRoutePaths.CREATE, () => import("./index")),
  createLazyRoute(
    CreateRoutePaths.CREATE_PAGE,
    () => import("render/page/CreatePage")
  ),
  createLazyRoute(
    CreateRoutePaths.CREATE_CYBOT,
    () => import("ai/cybot/CreateCybot")
  ),
  createLazyRoute(
    CreateRoutePaths.CREATE_PROMPT,
    () => import("ai/prompt/Create")
  ),
];
