// server/handleRender.js
import React from "react";
import { renderToReadableStream } from "react-dom/server";

import { createAppStore } from "app/store";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";
import i18nServer from "app/i18n/i18n.server";
import { detectSite, loadRoutes } from "app/web/siteRoutes";

/* 资源缓存（保持你的实现） */
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

    // 统一：SSR 首屏使用与客户端相同的站点与路由加载逻辑
    const siteId = detectSite(hostname);
    const initialRoutes = await loadRoutes(siteId, undefined);

    const store = createAppStore();
    const renderStartTime = performance.now();
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

    // 保留：writeToStreamAsync（注释段原样）+ 注入 siteId 给客户端
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

      // 1) 注入 Redux 初始状态
      const preloadedState = store.getState();
      writer.write(new TextEncoder().encode(serializeState(preloadedState)));

      // 2) 注入站点标识，供客户端在 hydrate 前加载相同路由
      const siteScript = `<script>window.__SITE_ID__=${JSON.stringify(siteId)};</script>`;
      writer.write(new TextEncoder().encode(siteScript));

      console.log(`Dispatch time: ${performance.now() - dispatchStartTime}ms`);

      doneLocal = true;
      tryCloseStream();
    }
    writeToStreamAsync();

    // 把 React 流写入 body
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
      <!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><title>服务器错误</title></head>
      <body><pre>${String(error)}</pre></body></html>
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
