import React, { lazy, Suspense } from "react";

import Full from "web/layout/Full";
import ChatPage from "./ChatPage";
export const chatRoutes = [
  {
    path: "/",
    element: <Full />,
    children: [
      {
        path: "chat/:id?",
        element: <ChatPage />,
      },
    ],
  },
];
