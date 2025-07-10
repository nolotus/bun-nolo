// 文件路径: web/entry.tsx

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { isProduction } from "utils/env";
import { webTokenManager } from "auth/web/tokenManager";
import App from "app/web/App";
import { createAppStore } from "app/store";
import { browserDb } from "database/browser/db";
import "./input.css";

const preloadedState = window.__PRELOADED_STATE__;

// 【核心修改】在创建 store 时注入 tokenManager
const browserStore = createAppStore({
  dbInstance: browserDb,
  tokenManager: webTokenManager, // <-- 注入 tokenManager
  preloadedState: preloadedState,
});

delete window.__PRELOADED_STATE__;

const hostname = window.location.hostname;
const domNode = document.getElementById("root");
const lng = window.navigator.language;

const AppRoot = () => (
  <React.StrictMode>
    <Provider store={browserStore}>
      {isProduction ? (
        <BrowserRouter>
          {/* 【核心修改】移除 tokenManager prop */}
          <App hostname={hostname} lng={lng} />
        </BrowserRouter>
      ) : (
        <HashRouter>
          {/* 【核心修改】移除 tokenManager prop */}
          <App hostname={hostname} lng={lng} />
        </HashRouter>
      )}
    </Provider>
  </React.StrictMode>
);

if (isProduction) {
  hydrateRoot(domNode, <AppRoot />);
} else {
  const root = createRoot(domNode);
  root.render(<AppRoot />);
}
