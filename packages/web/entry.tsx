// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "user";

import App from "./App";
let hostname = window.location.hostname;

const domNode = document.getElementById("root");
hydrateRoot(
  domNode,
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App hostname={hostname} lng={navigator.language} />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
