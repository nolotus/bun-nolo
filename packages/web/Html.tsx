import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { Provider } from "react-redux";
import store from "app/store";

import App from "./App";

export const Html = ({ url, renderContent, hostname, lng }) => {
  return (
    <Provider store={store}>
      <StaticRouter location={url}>
        <App preloadState={renderContent} hostname={hostname} lng={lng} />
      </StaticRouter>
    </Provider>
  );
};
