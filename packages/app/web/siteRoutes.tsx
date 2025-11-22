// app/web/siteRoutes.ts
import type { RouteObject } from "react-router-dom";

export type SiteId = "date" | "selfr" | "default";

const hostToSite: Record<string, SiteId> = {
  "nolotus.local": "date",
  "date.nolo.chat": "date",
  "selfr.nolo.chat": "selfr",
};

export const detectSite = (hostname: string): SiteId =>
  hostToSite[hostname] ?? "default";

export async function loadRoutes(
  site: SiteId,
  user?: any
): Promise<RouteObject[]> {
  if (site === "date") {
    const { dateRoutes } = await import("lab/date/dateRoutes");
    return dateRoutes;
  }

  if (site === "selfr") {
    const [
      { default: Navbar },
      { default: Moment },
      { default: Article },
      appRoutes,
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
        <Navbar />
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
          ...appRoutes.routes(user),
        ],
      },
    ];
  }

  const appRoutes = await import("app/web/routes");
  return appRoutes.routes(user);
}
