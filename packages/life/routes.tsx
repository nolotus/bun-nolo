import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";

import { Layout } from "./Layout";

export enum LifeRoutePaths {
  WELCOME = "life/",
  NOTES = "life/notes",
  ALL = "life/all",
  STATISTICS = "life/statistics",
}

const Welcome = (
  <LazyLoadComponent
    factory={() => import("app/pages/Welcome")}
    fallback={<div>Loading Welcome...</div>}
  />
);
const All = (
  <LazyLoadComponent
    factory={() => import("./web/All")}
    fallback={<div>Loading All...</div>}
  />
);
const Database = (
  <LazyLoadComponent
    factory={() => import("./web/Database")}
    fallback={<div>Loading All...</div>}
  />
);
const Statistics = (
  <LazyLoadComponent
    factory={() => import("./web/Statistics")}
    fallback={<div>Loading Statistics...</div>}
  />
);
const Notes = (
  <LazyLoadComponent
    factory={() => import("./web/Notes")}
    fallback={<div>Loading Notes...</div>}
  />
);

const Calendar = (
  <LazyLoadComponent
    factory={() => import("./web/Calendar")}
    fallback={<div>Loading Calendar...</div>}
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
