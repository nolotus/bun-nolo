import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";
import Full from "render/layout/Full";
const ChatPage = lazy(() => import("./ChatPage"));

export const routes = {
  path: "/",
  element: <Full />,
  children: [
    {
      path: "chat",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      ),
    },
  ],
};
