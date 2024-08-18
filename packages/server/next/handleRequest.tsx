import { renderToReadableStream } from "react-dom/server.browser";
import React from "react";
import { ServerStyleSheet } from "styled-components";
import App from "./App";

async function handleRequest(request) {
  const url = new URL(request.url);
  const sheet = new ServerStyleSheet();

  const js = await Bun.build({
    entrypoints: ["./packages/server/next/browser.tsx"],
    outdir: "./out",
  });
  console.log("js", js);

  const jsContent = await Bun.file(js.outputs[0].path).text();

  try {
    const jsx = sheet.collectStyles(<App initialPath={url.pathname} />);

    const stream = await renderToReadableStream(jsx);
    const styleTags = sheet.getStyleTags();

    return new Response(
      new ReadableStream({
        async start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `<!DOCTYPE html><html><head>${styleTags}</head><body><div id="root">`,
            ),
          );

          const reader = stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          controller.enqueue(
            new TextEncoder().encode(
              `</div><script type="module">${jsContent}</script></body></html>`,
            ),
          );

          controller.close();
        },
      }),
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } finally {
    sheet.seal();
  }
}

export default handleRequest;
