// app/router/sites/selfr.tsx
import type { RouteObject } from "react-router-dom";
import React from "react";

export async function buildRoutes(user?: any): Promise<RouteObject[]> {
  const [
    { default: NavbarComponent },
    { default: Moment },
    { default: Article },
    modRoutes,
    { Outlet },
  ] = await Promise.all([
    import("lab/s-station/Navbar"),
    import("lab/s-station/index"),
    import("lab/s-station/Article"),
    import("app/web/routes"),
    import("react-router-dom"),
  ]);

  const Layout = () => (
    <div>
      <NavbarComponent />
      <Outlet />
    </div>
  );

  return [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Moment /> },
        { path: "article", element: <Article /> },
        ...modRoutes.routes(user),
      ],
    },
  ];
}
