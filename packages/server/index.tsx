import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import App from "../../App";
import { readFile } from "../database/read";
await Bun.build({
  entrypoints: ["./packages/web/index.tsx"],
  outdir: "./public",
});

const text = await readFile();
if (process.env.ENV === "production") {
  Bun.serve({
    port: process.env.PORT,
    async fetch(req) {
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
} else {
  Bun.serve({
    port: process.env.PORT,
    async fetch(req) {
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
}
