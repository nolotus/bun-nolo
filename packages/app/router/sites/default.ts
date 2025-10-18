// app/router/sites/default.ts
import type { RouteObject } from "react-router-dom";

// 统一导出：按需构建默认站点路由
export async function buildRoutes(user?: any): Promise<RouteObject[]> {
  const mod = await import("app/web/routes");
  return mod.routes(user);
}
