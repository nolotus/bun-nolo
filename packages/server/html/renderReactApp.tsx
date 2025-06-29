import React from "react";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router-dom/server";
import App from "app/web/App";

export function renderReactApp(store, url, hostname, lng) {
  return (
    <Provider store={store}>
      <StaticRouter location={url}>
        <App hostname={hostname} lng={lng} />
      </StaticRouter>
    </Provider>
  );
}
