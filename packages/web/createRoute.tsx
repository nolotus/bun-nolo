import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";

const LazyLoadWrapper = ({ component }: { component: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{component}</Suspense>
);

export const createRoute = (path: string, component: React.ReactNode) => ({
  path,
  element: <LazyLoadWrapper component={component} />,
});
