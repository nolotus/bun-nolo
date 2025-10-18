// app/router/sites/date.ts
import type { RouteObject } from "react-router-dom";

// 约会站点（date.nolo.chat）
export async function buildRoutes(): Promise<RouteObject[]> {
  const mod = await import("lab/date/dateRoutes");
  return mod.dateRoutes;
}
