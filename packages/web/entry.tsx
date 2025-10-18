// web/entry.tsx
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import type { RouteObject } from "react-router-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { isProduction } from "utils/env";
import { webTokenManager } from "auth/web/tokenManager";
import App from "app/web/App";
import { createAppStore } from "app/store";
import { browserDb } from "database/browser/db";
import { detectSite, loadRoutes, type SiteId } from "app/web/siteRoutes";
import "./input.css";

declare global {
  interface Window {
    __PRELOADED_STATE__?: any;
    __SITE_ID__?: SiteId;
  }
}

const preloadedState = window.__PRELOADED_STATE__;
const hostname = window.location.hostname;
const lng = window.navigator.language;

// 创建浏览器端 store
const browserStore = createAppStore({
  dbInstance: browserDb,
  tokenManager: webTokenManager,
  preloadedState,
});
delete window.__PRELOADED_STATE__;

const domNode = document.getElementById("root") as HTMLElement;

(async () => {
  // 与 SSR 保持一致：优先使用服务端注入的 siteId；没有则自行判定
  const siteId: SiteId = window.__SITE_ID__ || detectSite(hostname);

  // hydrate 前预加载对应站点的路由，确保与 SSR 一致 -> 不闪烁
  const initialRoutes: RouteObject[] = await loadRoutes(siteId, undefined);

  const AppRoot = () => (
    <React.StrictMode>
      <Provider store={browserStore}>
        {isProduction ? (
          <BrowserRouter>
            <App hostname={hostname} lng={lng} initialRoutes={initialRoutes} />
          </BrowserRouter>
        ) : (
          <HashRouter>
            <App hostname={hostname} lng={lng} initialRoutes={initialRoutes} />
          </HashRouter>
        )}
      </Provider>
    </React.StrictMode>
  );

  if (isProduction) {
    hydrateRoot(domNode, <AppRoot />);
  } else {
    createRoot(domNode).render(<AppRoot />);
  }
})();
