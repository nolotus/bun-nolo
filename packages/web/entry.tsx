// src/react/index.tsx
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { isProduction } from "utils/env";
import { webTokenManager } from "auth/web/tokenManager";
import App from "app/web/App";

// 【修改】从统一的 store 文件导入工厂函数
import { createAppStore } from "app/store"; // 假设你把 store.ts 放在了这里
import "./input.css";

// 【修改】获取预加载状态
const preloadedState = window.__PRELOADED_STATE__;

// 【修改】使用工厂函数创建客户端 store，并注入预加载状态
const browserStore = createAppStore(preloadedState);

// 删除全局变量，防止内存泄漏
delete window.__PRELOADED_STATE__;

const hostname = window.location.hostname;
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const domNode = document.getElementById("root");
const lng = window.navigator.language;

if (isProduction) {
  hydrateRoot(
    domNode,
    <React.StrictMode>
      {/* 【修改】使用新创建的 browserStore */}
      <Provider store={browserStore}>
        <BrowserRouter>
          <App
            hostname={hostname}
            lng={lng}
            isDark={isDark}
            tokenManager={webTokenManager}
          />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} else {
  // ... 开发环境逻辑相同 ...
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
      <Provider store={browserStore}>
        <HashRouter>
          <App
            hostname={hostname}
            lng={lng}
            isDark={isDark}
            tokenManager={webTokenManager}
          />
        </HashRouter>
      </Provider>
    </React.StrictMode>
  );
}
