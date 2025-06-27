// handleRender.js (完整最终版本 - 已修复 TypeError)

import { createAppStore } from "app/store";
import { renderToReadableStream } from "react-dom/server";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";
// 导入专为服务器创建的 i18next 实例
// 请确保此路径相对于 handleRender.js 是正确的
import i18nServer from "app/i18n/i18n.server";

// 缓存机制
let cachedAssets = null;
let lastCheckTime = 0;
const CACHE_DURATION = 60000; // 缓存 60 秒

// 获取最新的 assets 数据，带缓存
const getLatestAssets = async () => {
  const currentTime = Date.now();
  if (cachedAssets && currentTime - lastCheckTime < CACHE_DURATION) {
    return cachedAssets; // 使用缓存
  }

  try {
    const assetsData = await Bun.file("public/latest-assets.json").text();
    cachedAssets = JSON.parse(assetsData);
    lastCheckTime = currentTime;
    return cachedAssets;
  } catch (error) {
    console.error("读取 latest-assets.json 失败", error);
    if (cachedAssets) {
      return cachedAssets; // 如果有缓存，返回缓存数据
    }
    // 如果没有缓存，提供一个默认值
    return {
      basePath: "/public/assets/",
      js: "",
      css: "",
      timestamp: "",
    };
  }
};

export const handleRender = async (req) => {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);

  const startTime = performance.now();

  // 获取最新的 assets 数据
  const assets = await getLatestAssets();

  // 构建资源URL
  const bootstrapJs = assets.js || "";
  const bootstrapCss = assets.css || "";

  let didError = false;

  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage?.split(",")[0] || "zh-CN";

  try {
    // --- 已修复 ---
    // i18n.init() 返回的 Promise 直接解析为 t 函数
    const t = await i18nServer.cloneInstance({ lng }).init();

    const seoData = {
      lang: lng,
      title: t("seo.title", { ns: "common" }),
      description: t("seo.description", { ns: "common" }),
    };
    // --- 修复结束 ---

    const renderStartTime = performance.now();
    const store = createAppStore();
    const stream = await renderToReadableStream(
      renderReactApp(store, url, hostname, lng),
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

    const [reactStream, copyReactStream] = stream.tee();

    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });

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

    const writeHeaderStartTime = performance.now();
    writer.write(new TextEncoder().encode(htmlStart(seoData, bootstrapCss)));
    console.log(
      `Write header time: ${performance.now() - writeHeaderStartTime}ms`
    );

    async function writeToStreamAsync() {
      const dispatchStartTime = performance.now();
      //for future dynamic change data
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
      //maybe need delete api relate
      // 获取预加载的状态并序列化

      const preloadedState = store.getState();
      writer.write(new TextEncoder().encode(serializeState(preloadedState)));

      console.log(`Dispatch time: ${performance.now() - dispatchStartTime}ms`);

      doneLocal = true;
      tryCloseStream();
    }

    writeToStreamAsync();

    const reader = copyReactStream.getReader();
    const proxyReactStream = async () => {
      const proxyStartTime = performance.now();
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

      console.log(
        `Proxy React stream time: ${performance.now() - proxyStartTime}ms`
      );
    };

    proxyReactStream();

    return new Response(readable, {
      status: didError ? 500 : 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error) {
    console.error("渲染过程中发生错误:", error);
    console.log(`Error handling time: ${performance.now() - startTime}ms`);

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
        <title>服务器错误</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #f5f5f5; color: #333; }
          .error-container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
          .error-title { color: #e74c3c; font-size: 24px; margin-bottom: 16px; }
          .error-message { color: #666; line-height: 1.6; margin-bottom: 24px; }
          .retry-button { background-color: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; }
          .retry-button:hover { background-color: #2980b9; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1 class="error-title">服务器暂时无法响应</h1>
          <p class="error-message">
            抱歉，服务器在处理您的请求时遇到了问题。<br>
            请稍后重试，如果问题持续存在，请联系技术支持。
          </p>
          <a href="javascript:window.location.reload()" class="retry-button">
            重新加载页面
          </a>
        </div>
        
        <script>
          setTimeout(() => {
            if (confirm('页面将自动刷新，是否继续？')) {
              window.location.reload();
            }
          }, 5000);
        </script>
      </body>
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
