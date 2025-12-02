import React, { Suspense, lazy } from "react";
import PageLoading from "render/web/ui/PageLoading";

const LazyUsage = lazy(() => import("life/web/Usage"));
const LazyUsersPage = lazy(() => import("auth/web/UsersPage"));

const Load = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

export const lifeRoutes = [
  {
    path: "/life",
    element: (
      <Load>
        <LazyUsage />
      </Load>
    ),
  },
  {
    path: "/life/usage",
    element: (
      <Load>
        <LazyUsage />
      </Load>
    ),
  },
  {
    path: "/life/users",
    element: (
      <Load>
        <LazyUsersPage />
      </Load>
    ),
  },
];
