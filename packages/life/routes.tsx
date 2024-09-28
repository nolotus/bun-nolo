import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";
import { PageLoader } from "render/blocks/PageLoader";

export enum LifeRoutePaths {
  STATISTICS = "life/statistics",
}

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
        { path: "statistics", element: Statistics },
        { path: "calendar", element: Calendar },
      ],
    },
  ],
};
