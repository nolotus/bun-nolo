// server/handleRender.js
// 职责：负责 SSR（流式渲染 React 应用），输出完整 HTML。
// - 生产环境：从 public/latest-assets.json 读取入口 JS/CSS
// - 开发环境：使用固定 /public/assets/entry.js|css，并自动附加 ?v=<buildVersion>
// - 根据开关在页面中注入 SSE 自动刷新脚本（/dev-reload）
// - dev：注入当前构建版本 cv，并对 reload 链路做端到端打点

import React from "react"; // 部分构建配置仍需要显式导入 React，保留
import { renderToReadableStream } from "react-dom/server";
import { createAppStore } from "app/store";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";
import i18nServer from "app/i18n/i18n.server";
import { detectSite, loadRoutes } from "app/web/siteRoutes";

// -----------------------------
// 环境与开关
// -----------------------------

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

const ENABLE_LIVE_RELOAD =
  !isProduction ||
  (typeof process !== "undefined" && process.env.ENABLE_LIVE_RELOAD === "1");

const ENABLE_DYNAMIC_DEMO = false;

// -----------------------------
// 静态资源信息：latest-assets.json + dev 默认值
// -----------------------------

const DEFAULT_DEV_ASSETS = {
  basePath: "/public/assets/",
  js: "/public/assets/entry.js",
  css: "/public/assets/entry.css",
  timestamp: "dev",
};

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

const getAssetsForRender = async () => {
  if (!isProduction) return DEFAULT_DEV_ASSETS;
  return getLatestAssets();
};

// -----------------------------
// dev reload 构建信息读取（用于注入 cv + 给 entry 加 ?v）
// -----------------------------

/**
 * 读取 public/.dev-reload-version
 * - 新格式（推荐）：JSON { version, builtAt, buildMs }
 * - 兼容旧格式：纯字符串（时间戳）
 */
const readDevBuildInfo = async () => {
  if (isProduction) return null;

  try {
    const raw = (await Bun.file("public/.dev-reload-version").text()).trim();
    if (!raw) return null;

    if (!raw.startsWith("{")) {
      const builtAt = Number(raw) || Date.now();
      return { version: String(raw), builtAt, buildMs: null };
    }

    const obj = JSON.parse(raw);
    if (!obj || typeof obj.version !== "string") return null;

    return {
      version: obj.version,
      builtAt: typeof obj.builtAt === "number" ? obj.builtAt : 0,
      buildMs: typeof obj.buildMs === "number" ? obj.buildMs : null,
    };
  } catch {
    return null;
  }
};

// -----------------------------
// 流写入工具
// -----------------------------

const encoder = new TextEncoder();
const writeString = (writer, str) => writer.write(encoder.encode(str));

// -----------------------------
// 注入脚本构建（可读性）
// -----------------------------

const buildLiveReloadScript = (cv) => {
  return `<script>
    (function () {
      var cv = ${JSON.stringify(cv || "")};
      window.__DEV_RELOAD_VERSION__ = cv;

      // 在 load 后再读取 navigation timing，避免 0
      window.addEventListener('load', function () {
        try {
          var builtAt = Number(sessionStorage.getItem('__DEV_RELOAD_BUILT_AT__') || '0');
          var buildMs = Number(sessionStorage.getItem('__DEV_RELOAD_BUILD_MS__') || '0');
          var buildToEventMs = Number(sessionStorage.getItem('__DEV_RELOAD_EVENT_LATENCY__') || '0');
          var reloadAt = Number(sessionStorage.getItem('__DEV_RELOAD_RELOAD_AT__') || '0');

          if (builtAt) {
            var nav = performance.getEntriesByType('navigation')[0];
            var navLoadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
            var navDclMs = nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null;

            // reloadAt 更接近“收到事件后触发 reload 的时间”
            var reloadToLoadMs = reloadAt ? (Date.now() - reloadAt) : navLoadMs;

            console.log('[dev-reload] timings', {
              buildMs: buildMs || null,
              buildToEventMs: buildToEventMs || null,
              reloadToDclMs: navDclMs,
              reloadToLoadMs: reloadToLoadMs
            });

            sessionStorage.removeItem('__DEV_RELOAD_BUILT_AT__');
            sessionStorage.removeItem('__DEV_RELOAD_BUILD_MS__');
            sessionStorage.removeItem('__DEV_RELOAD_EVENT_LATENCY__');
            sessionStorage.removeItem('__DEV_RELOAD_RELOAD_AT__');
          }
        } catch (_) {}
      });

      if (typeof EventSource === 'undefined') return;

      var isReloading = false;

      try {
        var url = '/dev-reload' + (cv ? ('?cv=' + encodeURIComponent(cv)) : '');
        var es = new EventSource(url);

        es.addEventListener('reload', function (e) {
          if (isReloading) return;

          var payload = null;
          try { payload = JSON.parse(e.data || '{}'); } catch (_) {}

          // 第一段：build 完成 -> 收到 SSE 的延迟
          try {
            if (payload && payload.builtAt) {
              var now = Date.now();
              var buildToEventMs = now - Number(payload.builtAt);
              console.log('[dev-reload] event', payload, 'build->event(ms)=', buildToEventMs);

              sessionStorage.setItem('__DEV_RELOAD_BUILT_AT__', String(payload.builtAt));
              sessionStorage.setItem('__DEV_RELOAD_BUILD_MS__', String(payload.buildMs || ''));
              sessionStorage.setItem('__DEV_RELOAD_EVENT_LATENCY__', String(buildToEventMs));
            }
          } catch (_) {}

          isReloading = true;

          // 记录 reload 触发时刻（用于第二段计算）
          try { sessionStorage.setItem('__DEV_RELOAD_RELOAD_AT__', String(Date.now())); } catch (_) {}

          // 给日志一点时间刷出
          setTimeout(function () { location.reload(); }, 30);
        });

        es.onerror = function () {
          console.warn('[dev-reload] connection error');
        };
      } catch (err) {
        console.error('[dev-reload] failed to connect', err);
      }
    })();
  </script>`;
};

// -----------------------------
// 主渲染逻辑
// -----------------------------

export const handleRender = async (req) => {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);

  let didError = false;
  const start = performance.now();

  try {
    // 1) 读取当前环境的静态资源信息
    const assets = await getAssetsForRender();

    // dev 下：读版本用于给 entry.js/css 加 ?v=...（实现“入口 URL 版本化”）
    const devInfo = !isProduction ? await readDevBuildInfo() : null;
    const devVersion = (devInfo && devInfo.version) || "";

    const addV = (assetUrl) => {
      if (!assetUrl) return "";
      if (!devVersion) return assetUrl;
      return assetUrl.includes("?")
        ? `${assetUrl}&v=${encodeURIComponent(devVersion)}`
        : `${assetUrl}?v=${encodeURIComponent(devVersion)}`;
    };

    const bootstrapJs = isProduction ? assets.js || "" : addV(assets.js || "");
    const bootstrapCss = isProduction
      ? assets.css || ""
      : addV(assets.css || "");

    // 2) 语言与 i18n 初始化
    const lng = (req.headers.get("accept-language") || "zh-CN").split(",")[0];
    const t = await i18nServer.cloneInstance({ lng }).init();

    const seoData = {
      lang: lng,
      title: t("seo.title", { ns: "common" }),
      description: t("seo.description", { ns: "common" }),
    };

    // 3) 与客户端保持一致：根据 host 识别站点并加载路由
    const siteId = detectSite(hostname);
    const initialRoutes = await loadRoutes(siteId, undefined);

    // 4) 创建 store 并开始 SSR
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

    // 5) tee 出一份流：一份用于控制状态，一份用于真正写入 HTML
    const [, copyReactStream] = reactStream.tee();

    // 通过 TransformStream 暴露给 Response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // 并发控制：等待「React 内容写完」和「本地脚本写完」两件事
    let doneReact = false;
    let doneLocal = false;

    const tryClose = () => {
      if (doneReact && doneLocal) {
        writeString(writer, htmlEnd);
        writer.close();
        console.log(`SSR total: ${Math.round(performance.now() - start)}ms`);
      }
    };

    // 6) 先写入 <head> 与样式/预加载
    writeString(writer, htmlStart(seoData, bootstrapCss));

    // 7) 异步写入：Redux 初始状态 + 站点脚本 + 可选功能（live reload / 动态 demo）
    (async () => {
      const preloadedState = store.getState();
      writeString(writer, serializeState(preloadedState));

      writeString(
        writer,
        `<script>window.__SITE_ID__=${JSON.stringify(siteId)};</script>`
      );

      // ---- Live Reload：在开启开关时注入 SSE 客户端脚本 ----
      if (ENABLE_LIVE_RELOAD) {
        // 这里的 cv 用 devInfo.version；如果读不到就空串（仍可连接 SSE）
        const cv = devVersion || "";
        writeString(writer, buildLiveReloadScript(cv));
      }

      // ---- 可选：动态 demo 片段（不写入 #root，避免影响 hydrate） ----
      if (ENABLE_DYNAMIC_DEMO) {
        const iterations = 8;
        for (let i = 0; i <= iterations; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 60 + Math.round(Math.random() * 120))
          );

          let content = `<div id="ST-${i}" style="display:none">Chunk ${i}</div>`;
          if (i > 0) {
            content += `<script id="SR-${i}">$U("ST-${i - 1}","ST-${i}")</script>`;
          }
          if (i === iterations) {
            content += `<script id="SR-${i}">$U("SR-${i}","SR-${i}")</script>`;
          }

          writeString(writer, content);
        }
      }

      doneLocal = true;
      tryClose();
    })();

    // 8) 同时把 React 流写入 #root 容器
    const reader = copyReactStream.getReader();

    (async () => {
      writeString(writer, '<div id="root">');

      while (true) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            doneReact = true;
            writeString(writer, "</div>");
            tryClose();
            break;
          }

          await writer.write(value);
        } catch (err) {
          console.error("读取 React 流错误:", err);
          doneReact = true;
          writeString(writer, "</div>");
          tryClose();
          break;
        }
      }
    })();

    // 9) 返回流式响应
    return new Response(readable, {
      status: didError ? 500 : 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error) {
    console.error("渲染错误:", error);

    const errorHtml = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"/><title>服务器错误</title><body><pre>${String(
      error
    )}</pre></body></html>`;

    return new Response(errorHtml, {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  }
};
