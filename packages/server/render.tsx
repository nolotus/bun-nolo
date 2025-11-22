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

// 可切换：是否演示“动态改变数据”的流式片段（保留但默认关闭）
const ENABLE_DYNAMIC_DEMO = false;

export const handleRender = async (req) => {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);
  const enc = new TextEncoder();
  const W = (writer, s) => writer.write(enc.encode(s));

  let didError = false;
  const start = performance.now();

  try {
    const assets = await getLatestAssets();
    const bootstrapJs = assets.js || "";
    const bootstrapCss = assets.css || "";

    const lng = (req.headers.get("accept-language") || "zh-CN").split(",")[0];
    const t = await i18nServer.cloneInstance({ lng }).init();
    const seoData = {
      lang: lng,
      title: t("seo.title", { ns: "common" }),
      description: t("seo.description", { ns: "common" }),
    };

    // 与客户端一致：按站点加载路由
    const siteId = detectSite(hostname);
    const initialRoutes = await loadRoutes(siteId, undefined);

    // 创建 store 并开始 SSR
    const store = createAppStore();
    const reactStream = await renderToReadableStream(
      renderReactApp(store, url, hostname, lng, initialRoutes),
      {
        bootstrapModules: bootstrapJs ? [bootstrapJs] : [],
        onError(err) {
          didError = true;
          console.error("React 渲染错误:", err);
        },
      }
    );

    // tee 出一份，便于边写头/状态、边输出 React 内容
    const [, copyReactStream] = reactStream.tee();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // 控制并发结束
    let doneReact = false;
    let doneLocal = false;
    const tryClose = () => {
      if (doneReact && doneLocal) {
        W(writer, htmlEnd);
        writer.close();
        console.log(`SSR total: ${Math.round(performance.now() - start)}ms`);
      }
    };

    // 写入 <head> 与样式/预加载
    W(writer, htmlStart(seoData, bootstrapCss));

    // 异步写入：Redux 初始状态 + 站点脚本 +（可选）动态片段
    (async () => {
      const preloadedState = store.getState();
      W(writer, serializeState(preloadedState));
      W(
        writer,
        `<script>window.__SITE_ID__=${JSON.stringify(siteId)};</script>`
      );

      // 保留动态改变数据：按需开启演示（不写入 #root，避免影响 hydrate）
      if (ENABLE_DYNAMIC_DEMO) {
        const iterations = 8;
        for (let i = 0; i <= iterations; i++) {
          await new Promise((r) =>
            setTimeout(r, 60 + Math.round(Math.random() * 120))
          );
          let content = `<div id="ST-${i}" style="display:none">Chunk ${i}</div>`;
          if (i > 0)
            content += `<script id="SR-${i}">$U("ST-${i - 1}","ST-${i}")</script>`;
          if (i === iterations)
            content += `<script id="SR-${i}">$U("SR-${i}","SR-${i}")</script>`;
          W(writer, content);
        }
      }

      doneLocal = true;
      tryClose();
    })();

    // 把 React 可读流写入 body
    const reader = copyReactStream.getReader();
    (async () => {
      W(writer, '<div id="root">');
      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            doneReact = true;
            W(writer, "</div>");
            tryClose();
            break;
          }
          await writer.write(value);
        } catch (err) {
          console.error("读取 React 流错误:", err);
          doneReact = true;
          W(writer, "</div>");
          tryClose();
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
    console.error("渲染错误:", error);
    return new Response(
      `<!doctype html><html lang="zh-CN"><meta charset="utf-8"/><title>服务器错误</title><body><pre>${String(
        error
      )}</pre></body></html>`,
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
