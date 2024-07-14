import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

export enum CreateRoutePaths {
  CREATE = "create",
  CREATE_PAGE = "create/page",
  CREATE_CYBOT = "create/cybot",
  CREATE_LLM = "create/llm",
}

export const createRoutes = [
  {
    path: CreateRoutePaths.CREATE,
    element: (
      <LazyLoadComponent
        factory={() => import("./index")}
        fallback={<div>Loading Create Index...</div>}
      />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_PAGE,
    element: (
      <LazyLoadComponent
        factory={() => import("render/page/CreatePage")}
        fallback={<div>Loading page for {CreateRoutePaths.CREATE_PAGE}</div>}
      />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_CYBOT,
    element: (
      <LazyLoadComponent
        factory={() => import("ai/cybot/CreateCybot")}
        fallback={<div>Loading page for {CreateRoutePaths.CREATE_CYBOT}</div>}
      />
    ),
  },
  {
    path: CreateRoutePaths.CREATE_LLM,
    element: (
      <LazyLoadComponent
        factory={() => import("ai/llm/CreateLLm")}
        fallback={<div>Loading page for {CreateRoutePaths.CREATE_LLM}</div>}
      />
    ),
  },
];
