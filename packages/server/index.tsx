import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import App from "../../App";
import { readFile } from "../database/read";

const text = await readFile();

if (process.env.ENV === "production") {
  Bun.serve({
    port: 443,
    hostname: "0.0.0.0",
    async fetch(req) {
      console.log("443 req", req);

      const url = new URL(req.url);
      if (url.pathname.startsWith("/public")) {
        const file = url.pathname.replace("/public", "");
        return new Response(Bun.file(`public/${file}`));
      }

      if (url.pathname === "/") {
        const app = createElement(App, { context: { text } });

        const stream = await renderToReadableStream(app, {
          bootstrapScripts: ["/public/index.js"],
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
    },
  });
}

Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  async fetch(req) {
    console.log("80 req", req);
    const url = new URL(req.url);
    if (url.pathname.startsWith("/public")) {
      const file = url.pathname.replace("/public", "");
      return new Response(Bun.file(`public/${file}`));
    }

    if (url.pathname === "/") {
      const app = createElement(App, { context: { text } });

      const stream = await renderToReadableStream(app, {
        bootstrapScripts: ["/public/index.js"],
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/blog") return new Response("Blog!");
    return new Response("404!");
  },
});
