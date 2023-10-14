// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
const text = window.NOLO_STORE_DATA;
let hostname = window.location.hostname;

hydrateRoot(
  document,
  <BrowserRouter>
    <App context={{ text }} hostname={hostname} />
  </BrowserRouter>
);
