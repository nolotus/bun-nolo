// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "app/store";

import App from "./App";
let hostname = window.location.hostname;

const domNode = document.getElementById("root");
const lng = window.navigator.language;
hydrateRoot(
  domNode,
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App hostname={hostname} lng={lng} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
