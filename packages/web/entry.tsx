// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "app/store";

import App from "./App";
import "./input.css";
let hostname = window.location.hostname;

const domNode = document.getElementById("root");
const lng = window.navigator.language;
const env = process.env.NODE_ENV;
const ClientApp = (
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App hostname={hostname} lng={lng} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
const isProduction = env === "production";
if (isProduction) {
  hydrateRoot(domNode, ClientApp);
} else {
  let root = createRoot(domNode);
  root.render(ClientApp);
}
