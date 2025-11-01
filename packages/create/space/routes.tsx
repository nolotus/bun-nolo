// routes/space.tsx
import React, { lazy, Suspense } from "react";
import SpaceLayout from "create/space/components/SpaceLayout";

// 子页面懒加载
const SpaceHome = lazy(() => import("create/space/pages/SpaceHome"));
const SpaceSettings = lazy(() => import("create/space/pages/SpaceSettings"));
const SpaceMembers = lazy(() => import("create/space/pages/SpaceMembers"));
const SpaceFiles = lazy(() => import("create/space/pages/SpaceFiles"));

const ContentFallback = (
  <div
    style={{ padding: 24, textAlign: "center", color: "var(--textSecondary)" }}
  >
    加载中...
  </div>
);

export const spaceRoutes = {
  path: "space/:spaceId",
  element: <SpaceLayout />, // 注意：这里不包 Suspense，Layout 始终可见
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={ContentFallback}>
          <SpaceHome />
        </Suspense>
      ),
    },
    {
      path: "settings",
      element: (
        <Suspense fallback={ContentFallback}>
          <SpaceSettings />
        </Suspense>
      ),
    },
    {
      path: "members",
      element: (
        <Suspense fallback={ContentFallback}>
          <SpaceMembers />
        </Suspense>
      ),
    },
    {
      path: "files",
      element: (
        <Suspense fallback={ContentFallback}>
          <SpaceFiles />
        </Suspense>
      ),
    },
  ],
};
