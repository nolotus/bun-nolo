import React from "react";
import { UserProvider } from "user";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export const Html = ({ url, renderContent, hostname, lng }) => {
  return (
    <UserProvider>
      <StaticRouter location={url}>
        <App preloadState={renderContent} hostname={hostname} lng={lng} />
      </StaticRouter>
    </UserProvider>
  );
};
