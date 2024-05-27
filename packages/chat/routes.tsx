import React, { Suspense, lazy } from "react";
import { PageLoading } from "render/blocks/PageLoading";
import Full from "render/layout/Full";
const ChatPage = lazy(() => import("./ChatPage"));

export const routes = {
  path: "/",
  element: <Full />,
  children: [
    {
      path: "chat",
      element: (
        <Suspense fallback={<PageLoading />}>
          <ChatPage />
        </Suspense>
      ),
    },
  ],
};
