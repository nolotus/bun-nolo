// packages/server/entry.ts

import { serve, file as bunFile } from "bun";
import { Cron } from "croner";

import { isProduction } from "utils/env";
import { handleRequest } from "./handleRequest";
import { tasks } from "./tasks";

import { API_ENDPOINTS, API_VERSION } from "database/config";

import { handleChatRequest } from "./handlers/chatHandler";
import { handleFetchWebpage } from "./handlers/fetchWebpageHandler";
import { handleBrowserTool } from "./handlers/browserToolHandler";
import { handleGetTransactions } from "./handlers/getTransactionsHandler";
import { handleApplyDiff } from "./handlers/applyDiffHandler";
import { handleApifyActor } from "./handlers/apifyActorHandler";

import { databaseRoutes } from "./databaseRoutes";
import { sqliteRoutes } from "./sqliteRoutes";

// live-reload SSE
import { devReloadRoute, ENABLE_LIVE_RELOAD } from "./devReload";

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const STATIC_CACHE_HEADERS: Record<string, string> = isProduction
  ? { "Cache-Control": "public, max-age=31536000, immutable" }
  : { "Cache-Control": "no-cache" };

type HttpMethod = "GET" | "POST" | "OPTIONS";
type RouteHandler = (req: Request) => Response | Promise<Response>;
type RouteDefinition =
  | Response
  | RouteHandler
  | Partial<Record<HttpMethod, RouteHandler>>;

const createOptionsResponse = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

const startTasks = () => {
  tasks.forEach(({ interval, task }) => Cron(interval, task).trigger());
};

const apiRoutes: Record<string, RouteDefinition> = {
  "/public/*": (req: Request) => {
    const url = new URL(req.url);
    const filePath = url.pathname.substring("/public/".length);

    const isDev = !isProduction;

    const isDevHashedChunk =
      isDev &&
      filePath.startsWith("assets/chunks/") &&
      /-[A-Z0-9]{8,}\.js$/i.test(filePath);

    const isDevHashedAsset =
      isDev &&
      filePath.startsWith("assets/assets/") &&
      /-[A-Z0-9]{8,}\.[a-z0-9]+$/i.test(filePath);

    // ✅ 新增：dev 的入口文件，如果使用了 ?v=...，也可以放心 immutable
    const isDevEntry =
      isDev &&
      (filePath === "assets/entry.js" || filePath === "assets/entry.css") &&
      url.searchParams.has("v");

    const headers: Record<string, string> =
      isDevHashedChunk || isDevHashedAsset || isDevEntry
        ? { "Cache-Control": "public, max-age=31536000, immutable" }
        : STATIC_CACHE_HEADERS;

    return new Response(bunFile(`public/${filePath}`), { headers });
  },

  // 浏览器 SSE：/dev-reload
  "/dev-reload": (req: Request) => devReloadRoute(req),

  "/api/status": new Response("OK"),

  [API_ENDPOINTS.HI]: {
    GET: () => new Response(JSON.stringify({ API_VERSION })),
  },

  [API_ENDPOINTS.CHAT]: {
    POST: (req: Request) => handleChatRequest(req, CORS_HEADERS),
    OPTIONS: () => createOptionsResponse(),
  },

  [API_ENDPOINTS.TRANSACTIONS]: {
    POST: (req: Request) => handleGetTransactions(req),
    OPTIONS: () => createOptionsResponse(),
  },

  "/api/fetch-webpage": {
    POST: (req: Request) => handleFetchWebpage(req),
    OPTIONS: () => createOptionsResponse(),
  },

  "/api/apify-actor": {
    POST: (req: Request) => handleApifyActor(req),
    OPTIONS: () => createOptionsResponse(),
  },

  "/api/browser-tool": {
    POST: (req: Request) => handleBrowserTool(req),
    OPTIONS: () => createOptionsResponse(),
  },

  "/api/apply-diff": {
    POST: (req: Request) => handleApplyDiff(req),
    OPTIONS: () => createOptionsResponse(),
  },

  ...databaseRoutes,
  ...sqliteRoutes,
};

const createServerOptions = () => ({
  routes: apiRoutes,
  idleTimeout: isProduction ? 60 : 0,
  hostname: "0.0.0.0",
  fetch: handleRequest,
  websocket: {
    message: (ws: any) => ws.send("Received"),
  },
});

const startHttpServer = () => {
  serve({ ...createServerOptions(), port: HTTP_PORT });
  console.log(`HTTP server started on port ${HTTP_PORT}`);
};

const startHttpsServer = () => {
  if (!isProduction) {
    console.log("HTTPS server not started (not in production mode)");
    return;
  }

  serve({
    ...createServerOptions(),
    port: HTTPS_PORT,
    tls: {
      key: bunFile("./key.pem"),
      cert: bunFile("./cert.pem"),
    },
  });

  console.log(`HTTPS server started on port ${HTTPS_PORT}`);
};

const bootstrap = () => {
  console.log(
    "isProduction:",
    isProduction,
    "ENABLE_LIVE_RELOAD:",
    ENABLE_LIVE_RELOAD
  );
  startHttpServer();
  startHttpsServer();
  // startTasks();
};

bootstrap();
