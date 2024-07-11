import { api } from "app/api";
import { store } from "app/store";
import React from "react";
import { renderToReadableStream } from "react-dom/server.browser";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router-dom/server";
import App from "web/App";

import assets from "../../public/assets.json";
// import inject from "@stylexjs/dev-runtime";

// inject({
//   classNamePrefix: "x",
//   dev: true,
//   test: false,
// });
export const handleRender = async (req) => {
  const bootstrapJs = `/${assets.js}`;
  const bootstrapCss = `/${assets.css}`;
  const url = new URL(req.url);
  let didError = false;

  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage.split(",")[0];
  const hostname = req.headers.get("host");

  try {
    const stream = await renderToReadableStream(
      <Provider store={store}>
        <StaticRouter location={url}>
          <App hostname={hostname} lng={lng} />
        </StaticRouter>
      </Provider>,
      {
        bootstrapModules: [bootstrapJs],
        onError(error) {
          didError = true;
        },
      },
    );
    const [, copyRenderReactStream] = stream.tee();
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });
    let doneReact = false;
    let doneLocal = false;
    const writer = writable.getWriter();
    const tryCloseStream = () => {
      if (doneReact && doneLocal) {
        writer.write(
          new TextEncoder().encode(`
            </body>
          </html>
        `),
        );
        writer.close();
      }
    };
    writer.write(
      new TextEncoder().encode(`
      <!DOCTYPE html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="nolotus" />
        <title>nolotus</title>
        <link rel="stylesheet" href="${bootstrapCss}"></link>

        <script>
          function $U(h, s) {
            document.getElementById(h)?.remove();
            document.getElementById(h.replace('ST', 'SR'))?.remove();
          }
        </script>
      </head>
      <body>
    `),
    );
    async function writeToStreamAsync() {
      // const iterations = 30;
      // for (let i = 0; i <= iterations; i++) {
      //   await new Promise((resolve) =>
      //     setTimeout(resolve, Math.round(Math.random() * 100))
      //   );
      //   let content = `<div id="ST-${i}">Iteration ${i}</div>`;
      //   if (i > 0) {
      //     content += `<script id="SR-${i}">$U("ST-${
      //       i - 1
      //     }","ST-${i}")</script>`;
      //   }
      //   if (i === iterations) {
      //     content += `<script id="SR-${i}">$U("SR-${i}","SR-${i}")</script>`;
      //   }
      //   writer.write(new TextEncoder().encode(content));
      // }
      await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));

      const preloadedState = store.getState();
      writer.write(
        new TextEncoder().encode(`
          <script>
            // WARNING: See the following for security issues around embedding JSON in HTML:
            // https://redux.js.org/usage/server-rendering#security-considerations
            window.__PRELOADED_STATE__ = ${JSON.stringify(
              preloadedState,
            ).replace(/</g, "\\u003c")}
          </script>
        `),
      );
      doneLocal = true;
      tryCloseStream();
    }
    writeToStreamAsync();
    const reader = copyRenderReactStream.getReader();
    const proxyReactStream = async () => {
      let finish = false;
      while (!finish) {
        const { done, value } = await reader.read();
        if (done) {
          finish = true;
          doneReact = true;
          writer.write(new TextEncoder().encode("</div>"));
          tryCloseStream();
          break;
        }
        writer.write(value);
      }
    };
    writer.write(new TextEncoder().encode('<div id="root">'));
    proxyReactStream();
    return new Response(readable, {
      status: didError ? 500 : 200,
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    return new Response("<h1>抱歉，服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
