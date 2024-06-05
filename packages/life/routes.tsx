import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";
import { PageLoader } from "render/blocks/PageLoader";

export enum LifeRoutePaths {
  WELCOME = "life/",
  NOTES = "life/notes",
  ALL = "life/all",
  STATISTICS = "life/statistics",
}

const Welcome = (
  <LazyLoadComponent
    factory={() => import("app/pages/Welcome")}
    fallback={<PageLoader />}
  />
);
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
const Notes = (
  <LazyLoadComponent
    factory={() => import("./web/Notes")}
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
        { index: true, element: Welcome },
        { path: "all", element: All },
        { path: "database", element: Database },
        { path: "statistics", element: Statistics },
        { path: "notes", element: Notes },
        { path: "calendar", element: Calendar },
      ],
    },
  ],
};
