import { renderToReadableStream } from "react-dom/server.browser";
import React from "react";
import { ServerStyleSheet } from "styled-components";
import App from "./App";
import path from "path";

// 用于存储构建结果的缓存
let buildCache = null;

async function handleRequest(request) {
  const url = new URL(request.url);
  const sheet = new ServerStyleSheet();

  // 只在首次请求或者服务重启后构建
  if (!buildCache) {
    console.log("Building...");
    const result = await Bun.build({
      entrypoints: ["./packages/server/next/browser.tsx"],
      outdir: "./out",
      splitting: true,
      naming: "[name].[hash].[ext]",
    });

    buildCache = result.outputs.filter((output) => output.path.endsWith(".js"));
    console.log("Build complete.");
  } else {
    console.log("Using cached build result.");
  }

  // 使用缓存的构建结果
  const jsFiles = buildCache;

  try {
    const jsx = sheet.collectStyles(<App initialPath={url.pathname} />);
    const stream = await renderToReadableStream(jsx);
    const styleTags = sheet.getStyleTags();

    // 生成预加载标签
    const preloadTags = jsFiles
      .map((file) => {
        const fileName = path.basename(file.path);
        return `<link rel="preload" href="/js/${fileName}" as="script">`;
      })
      .join("");

    return new Response(
      new ReadableStream({
        async start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `<!DOCTYPE html><html><head>${styleTags}${preloadTags}</head><body><div id="root">`,
            ),
          );

          const reader = stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          // 插入所有 JS 文件
          for (const file of jsFiles) {
            const fileName = path.basename(file.path);
            controller.enqueue(
              new TextEncoder().encode(
                `<script type="module" src="/js/${fileName}"></script>`,
              ),
            );
          }

          controller.enqueue(new TextEncoder().encode(`</div></body></html>`));

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
