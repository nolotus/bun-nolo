import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";
import { PageLoader } from "render/blocks/PageLoader";

export enum LifeRoutePaths {
  ALL = "life/all",
  STATISTICS = "life/statistics",
}

const All = (
  <LazyLoadComponent
    factory={() => import("./web/All")}
    fallback={<PageLoader />}
  />
);
const Database = (
  <LazyLoadComponent
    factory={() => import("./web/Database")}
    fallback={<PageLoader />}
  />
);
const Statistics = (
  <LazyLoadComponent
    factory={() => import("./web/Statistics")}
    fallback={<PageLoader />}
  />
);

const Calendar = (
  <LazyLoadComponent
    factory={() => import("./web/Calendar")}
    fallback={<PageLoader />}
  />
);
export const routes = {
  path: "/",
  element: <Layout />,
  children: [
    {
      path: "life",
      children: [
        { index: true, element: Database },
        { path: "all", element: All },
        { path: "statistics", element: Statistics },
        { path: "calendar", element: Calendar },
      ],
    },
  ],
};
