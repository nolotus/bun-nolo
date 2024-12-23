// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { isProduction } from "utils/env";

import App from "./App";
import { browserStore } from "./store";
import "./input.css";

const hostname = window.location.hostname;

const isDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const domNode = document.getElementById("root");
const lng = window.navigator.language;

delete window.__PRELOADED_STATE__;
if (isProduction) {
  hydrateRoot(
    domNode,
    <React.StrictMode>
      <Provider store={browserStore}>
        <BrowserRouter>
          <App hostname={hostname} lng={lng} theme={isDark ? "dim" : "light"} />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  );
} else {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
      <Provider store={browserStore}>
        <HashRouter>
          <App hostname={hostname} lng={lng} theme={isDark ? "dim" : "light"} />
        </HashRouter>
      </Provider>
    </React.StrictMode>,
  );
}
