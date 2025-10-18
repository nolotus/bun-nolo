// app/web/siteRoutes.ts
import type { RouteObject } from "react-router-dom";

export type SiteId = "date" | "selfr" | "default";

const selfrUrl = "selfr.nolo.chat";
const dateUrl = "date.nolo.chat";

export function detectSite(hostname: string): SiteId {
  if (hostname === "nolotus.local" || hostname === dateUrl) return "date";
  if (hostname === selfrUrl) return "selfr";
  return "default";
}

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

  // default
  const mod = await import("app/web/routes");
  return mod.routes(user);
}
