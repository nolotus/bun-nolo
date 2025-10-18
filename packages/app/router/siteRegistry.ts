// app/router/siteRegistry.ts
import type { RouteObject } from "react-router-dom";

type Loader = (ctx: { user?: any }) => Promise<RouteObject[]>;

interface SiteEntry {
  id: string;
  match: (hostname: string) => boolean;
  loader: Loader;
}

const selfrUrl = "selfr.nolo.chat";
const dateUrl = "date.nolo.chat";

// 使用动态 import 保持分包；新增站点只需要新增一条配置
export const siteRegistry: SiteEntry[] = [
  {
    id: "date",
    match: (h) => h === "nolotus.local" || h === dateUrl,
    loader: async () => {
      const m = await import("./sites/date");
      return m.buildRoutes();
    },
  },
  {
    id: "selfr",
    match: (h) => h === selfrUrl,
    loader: async ({ user }) => {
      const m = await import("./sites/selfr");
      return m.buildRoutes(user);
    },
  },
  {
    id: "default",
    match: () => true,
    loader: async ({ user }) => {
      const m = await import("./sites/default");
      return m.buildRoutes(user);
    },
  },
];

// 单一入口：根据 hostname 解析站点并返回对应路由
export async function loadSiteRoutes(hostname: string, user?: any) {
  const site = siteRegistry.find((s) => s.match(hostname))!;
  return site.loader({ user });
}
