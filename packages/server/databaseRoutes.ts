// databaseRoutes.ts
import { API_ENDPOINTS } from "database/config";
import { handleReadSingle } from "database/server/read";
import { handleDelete } from "database/server/delete";
import { createRouteConfig } from "./routeFactory";

export const databaseRouteConfigs = [
  createRouteConfig({
    path: `${API_ENDPOINTS.DATABASE}/read/:id`,
    handlers: {
      GET: async (req) => handleReadSingle(req),
    },
    allowedMethods: ["GET", "OPTIONS"],
    enableCors: true, // 明确启用 CORS
  }),
  createRouteConfig({
    path: `${API_ENDPOINTS.DATABASE}/delete/:id`,
    handlers: {
      DELETE: async (req) => handleDelete(req),
    },
    allowedMethods: ["DELETE", "OPTIONS"],
    enableCors: true, // 明确启用 CORS
  }),
];

// 将配置转为 apiRoutes 格式
export const databaseRoutes = databaseRouteConfigs.reduce(
  (acc, { path, route }) => {
    acc[path] = route;
    return acc;
  },
  {}
);
