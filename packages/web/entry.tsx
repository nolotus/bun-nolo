// web/entry.tsx
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
// 【核心修改】使用你提供的正确路径导入浏览器数据库实例
import { browserDb } from "database/browser/db";
import "./input.css";

// 获取预加载状态
const preloadedState = window.__PRELOADED_STATE__;

// 调用 createAppStore 时，传入包含正确 db 实例和 preloadedState 的配置对象
const browserStore = createAppStore({
  dbInstance: browserDb, // <-- 直接使用导入的 browserDb
  preloadedState: preloadedState,
});

// 删除全局变量，防止内存泄漏
delete window.__PRELOADED_STATE__;

const hostname = window.location.hostname;
const domNode = document.getElementById("root");
const lng = window.navigator.language;

if (isProduction) {
  hydrateRoot(
    domNode,
    <React.StrictMode>
      <Provider store={browserStore}>
        <BrowserRouter>
          <App hostname={hostname} lng={lng} tokenManager={webTokenManager} />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} else {
  // 开发环境逻辑相同
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
      <Provider store={browserStore}>
        <HashRouter>
          <App hostname={hostname} lng={lng} tokenManager={webTokenManager} />
        </HashRouter>
      </Provider>
    </React.StrictMode>
  );
}
