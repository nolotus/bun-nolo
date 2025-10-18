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
import { loadSiteRoutes } from "app/router/siteRegistry";
import "./input.css";

const preloadedState = (window as any).__PRELOADED_STATE__;
const hostname = window.location.hostname;
const lng = window.navigator.language;

// 创建 store
const browserStore = createAppStore({
  dbInstance: browserDb,
  tokenManager: webTokenManager,
  preloadedState,
});
delete (window as any).__PRELOADED_STATE__;

// 预构建首屏路由以避免水合闪烁（与 SSR 使用同一解析器）
async function bootstrap() {
  const initialRoutes: RouteObject[] = await loadSiteRoutes(
    hostname,
    undefined
  );

  const AppRoot: React.FC = () => (
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

  const domNode = document.getElementById("root") as HTMLElement;
  if (isProduction) {
    hydrateRoot(domNode, <AppRoot />);
  } else {
    createRoot(domNode).render(<AppRoot />);
  }
}

bootstrap();
