// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";

import App from "./App";
import { browserStore } from "./store";
import "./input.css";
import { isProduction } from "utils/env";

const hostname = window.location.hostname;

const domNode = document.getElementById("root");
const lng = window.navigator.language;

delete window.__PRELOADED_STATE__;
if (isProduction) {
  hydrateRoot(
    domNode,
    <React.StrictMode>
      <Provider store={browserStore}>
        <BrowserRouter>
          <App hostname={hostname} lng={lng} />
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
          <App hostname={hostname} lng={lng} />
        </HashRouter>
      </Provider>
    </React.StrictMode>,
  );
}
