import React, { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { App } from "web";
import { memCache } from "app";

import { StaticRouter } from "react-router-dom/server";

if (process.env.ENV === "production") {
  Bun.serve({
    port: 443,
    hostname: "0.0.0.0",
    async fetch(req) {
      console.log("443 req", req);

      const url = new URL(req.url);
      const Html = () => {
        return (
          <StaticRouter location={req.url}>
            <App context={{ text }} hostname={req.host} />
          </StaticRouter>
        );
      };

      if (url.pathname.startsWith("/public")) {
        const file = url.pathname.replace("/public", "");
        return new Response(Bun.file(`public/${file}`));
      }

      if (url.pathname === "/") {
        const app = createElement(Html);

        const stream = await renderToReadableStream(app, {
          bootstrapScripts: ["/public/entry.js"],
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (url.pathname === "/blog") return new Response("Blog!");
      return new Response("404!");
    },
    tls: {
      key: Bun.file("./key.pem"),
      cert: Bun.file("./cert.pem"),
      ca: Bun.file("./ca.pem"),
    },
  });
}

Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/public")) {
      const file = url.pathname.replace("/public", "");
      return new Response(Bun.file(`public/${file}`));
    }

    if (url.pathname === "/api") {
      return new Response("Hi!");
    } else {
      console.log("server render");
      try {
        let didError = false;
        const renderContent = Array.from(memCache, ([name, value]) => ({
          id: name,
          value,
        }));

        const Html = () => {
          return (
            <StaticRouter location={url}>
              <App preloadState={renderContent} hostname={req.host} />
            </StaticRouter>
          );
        };
        const app = createElement(Html);

        const stream = await renderToReadableStream(app, {
          bootstrapScripts: ["/public/entry.js"],
          onError(error) {
            didError = true;
            console.error(error);
          },
        });
        return new Response(stream, {
          status: didError ? 500 : 200,
          headers: { "content-type": "text/html" },
        });
      } catch (error) {
        return new Response("<h1>Something went wrong</h1>", {
          status: 500,
          headers: { "content-type": "text/html" },
        });
      }
    }
  },
});
