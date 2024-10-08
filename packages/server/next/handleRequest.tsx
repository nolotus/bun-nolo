import { renderToReadableStream } from "react-dom/server.browser";
import React from "react";
import App from "./App";
import path from "path";

// 用于存储构建结果的缓存
let buildCache = null;

async function handleRequest(request) {
  const url = new URL(request.url);

  // 只在首次请求或者服务重启后构建
  if (!buildCache) {
    console.log("Building...");
    const result = await Bun.build({
      entrypoints: ["packages/server/next/browser.tsx"],
      outdir: "out",
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

  const stream = await renderToReadableStream(
    <App initialPath={url.pathname} />,
  );

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
          new TextEncoder("utf-8").encode(
            `<!DOCTYPE html><html><head><meta charset="utf-8">${preloadTags}</head><body><div id="root">`,
          ),
        );

        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        // 手动插入所有 JS 文件
        for (const file of jsFiles) {
          const fileName = path.basename(file.path);
          controller.enqueue(
            new TextEncoder("utf-8").encode(
              `<script type="module" src="/js/${fileName}"></script>`,
            ),
          );
        }

        controller.enqueue(
          new TextEncoder("utf-8").encode(`</div></body></html>`),
        );

        controller.close();
      },
    }),
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export default handleRequest;
