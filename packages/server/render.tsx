import React, { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { memCache } from "app";
import { Html } from "web/Html";
import assets from "../../public/output.json";

export const handleRender = async (req) => {
  const url = new URL(req.url);
  let didError = false;
  const renderContent = Array.from(memCache, ([name, value]) => ({
    id: name,
    value,
  }));
  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage.split(",")[0];

  try {
    const data = { url, renderContent, hostnameL: req.host, lng };
    const app = createElement(Html, data);
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: [`/public/${assets.path}`],
      onError(error) {
        didError = true;
        console.error(`渲染错误: ${error}`);
      },
    });
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
        `)
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
        <meta name="description" content="Bun, Elysia & React" />
        <title>Bun, Elysia & React</title>
        <link rel="stylesheet" href="/public/output.css"></link>
        <script>
          function $U(h, s) {
            document.getElementById(h)?.remove();
            document.getElementById(h.replace('ST', 'SR'))?.remove();
          }
        </script>
        <script
          dangerouslySetInnerHTML={{
            __html: window.NOLO_STORE_DATA=${JSON.stringify(renderContent)},
          }}
        ></script>
      </head>
      <body>
    `)
    );
    async function writeToStreamAsync() {
      const iterations = 30;
      for (let i = 0; i <= iterations; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.round(Math.random() * 100))
        );
        let content = `<div id="ST-${i}">Iteration ${i}</div>`;
        if (i > 0) {
          content += `<script id="SR-${i}">$U("ST-${
            i - 1
          }","ST-${i}")</script>`;
        }
        if (i === iterations) {
          content += `<script id="SR-${i}">$U("SR-${i}","SR-${i}")</script>`;
        }
        writer.write(new TextEncoder().encode(content));
      }
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
    console.error(`处理请求时发生错误: ${error}`);
    return new Response("<h1>抱歉，服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html" },
    });
  }
};
