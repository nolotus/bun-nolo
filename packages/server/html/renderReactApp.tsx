// server/html/renderReactApp.tsx
import React from "react";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router-dom/server";
import type { RouteObject } from "react-router-dom";
import App from "app/web/App";

export function renderReactApp(
  store: any,
  url: URL,
  hostname: string,
  lng: string,
  initialRoutes: RouteObject[]
) {
  return (
    <Provider store={store}>
      <StaticRouter location={url}>
        <App hostname={hostname} lng={lng} initialRoutes={initialRoutes} />
      </StaticRouter>
    </Provider>
  );
}
