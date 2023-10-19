// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
let hostname = window.location.hostname;

const domNode = document.getElementById("root");
hydrateRoot(
  domNode,
  <BrowserRouter>
    <App hostname={hostname} lng={navigator.language} />
  </BrowserRouter>
);
