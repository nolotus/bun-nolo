// server/handleRender.js
import React from "react";
import { renderToReadableStream } from "react-dom/server";

import { createAppStore } from "app/store";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";
import i18nServer from "app/i18n/i18n.server";
import { loadSiteRoutes } from "app/router/siteRegistry";

/* ----------------------- 资源缓存 ----------------------- */
let cachedAssets = null;
let lastCheckTime = 0;
const CACHE_DURATION = 60_000;

const getLatestAssets = async () => {
  const now = Date.now();
  if (cachedAssets && now - lastCheckTime < CACHE_DURATION) return cachedAssets;

  try {
    const assetsData = await Bun.file("public/latest-assets.json").text();
    cachedAssets = JSON.parse(assetsData);
    lastCheckTime = now;
    return cachedAssets;
  } catch (error) {
    console.error("读取 latest-assets.json 失败", error);
    if (cachedAssets) return cachedAssets;
    return { basePath: "/public/assets/", js: "", css: "", timestamp: "" };
  }
};

/* ----------------------- 主处理函数 ----------------------- */
export const handleRender = async (req) => {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);

  const startTime = performance.now();
  const assets = await getLatestAssets();
  const bootstrapJs = assets.js || "";
  const bootstrapCss = assets.css || "";
  let didError = false;

  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage?.split(",")[0] || "zh-CN";

  try {
    const t = await i18nServer.cloneInstance({ lng }).init();
    const seoData = {
      lang: lng,
      title: t("seo.title", { ns: "common" }),
      description: t("seo.description", { ns: "common" }),
    };

    // 核心：统一通过注册表解析首屏路由（SSR）
    const initialRoutes = await loadSiteRoutes(hostname, undefined);

    const renderStartTime = performance.now();
    const store = createAppStore();

    const stream = await renderToReadableStream(
      renderReactApp(store, url, hostname, lng, initialRoutes),
      {
        bootstrapModules: bootstrapJs ? [bootstrapJs] : [],
        onError(error) {
          didError = true;
          console.error("React 渲染错误:", error);
        },
      }
    );
    console.log(
      `Render to stream time: ${performance.now() - renderStartTime}ms`
    );

    // 复制 React 流，用于手工拼装 HTML
    const [, copyReactStream] = stream.tee();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    let doneReact = false;
    let doneLocal = false;
    const tryCloseStream = () => {
      if (doneReact && doneLocal) {
        writer.write(new TextEncoder().encode(htmlEnd));
        writer.close();
        console.log(`Total time: ${performance.now() - startTime}ms`);
      }
    };

    // 写 head 与样式
    writer.write(new TextEncoder().encode(htmlStart(seoData, bootstrapCss)));

    // === 保留的 writeToStreamAsync，用于后续传递动态片段/数据 ===
    async function writeToStreamAsync() {
      const dispatchStartTime = performance.now();

      // for future dynamic change data
      // const iterations = 30;
      // for (let i = 0; i <= iterations; i++) {
      //   await new Promise((resolve) =>
      //     setTimeout(resolve, Math.round(Math.random() * 100)),
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
      // maybe need delete api relate

      const preloadedState = store.getState();
      writer.write(new TextEncoder().encode(serializeState(preloadedState)));

      console.log(`Dispatch time: ${performance.now() - dispatchStartTime}ms`);

      doneLocal = true;
      tryCloseStream();
    }
    writeToStreamAsync();

    // 将 React 可读流写入 body
    const reader = copyReactStream.getReader();
    (async () => {
      writer.write(new TextEncoder().encode('<div id="root">'));
      let finish = false;
      while (!finish) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            finish = true;
            doneReact = true;
            writer.write(new TextEncoder().encode("</div>"));
            tryCloseStream();
            break;
          }
          writer.write(value);
        } catch (error) {
          console.error("读取 React 流时发生错误:", error);
          finish = true;
          doneReact = true;
          writer.write(new TextEncoder().encode("</div>"));
          tryCloseStream();
          break;
        }
      }
    })();

    return new Response(readable, {
      status: didError ? 500 : 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error) {
    console.error("渲染过程中发生错误:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head><meta charset="UTF-8" /><title>服务器错误</title></head>
      <body><pre>${String(error)}</pre></body>
      </html>
      `,
      {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
        },
      }
    );
  }
};
