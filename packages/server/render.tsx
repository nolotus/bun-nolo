// render.js
import { store } from "app/store";
import { renderToReadableStream } from "react-dom/server";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";

// 保留原有的缓存机制
let cachedAssets = null;
let lastCheckTime = 0;
const CACHE_DURATION = 60000; // 缓存 60 秒

const getLatestAssets = async () => {
  const currentTime = Date.now();
  if (cachedAssets && currentTime - lastCheckTime < CACHE_DURATION) {
    return cachedAssets;
  }

  try {
    const assetsData = await Bun.file("public/latest-assets.json").text();
    cachedAssets = JSON.parse(assetsData);
    lastCheckTime = currentTime;
    return cachedAssets;
  } catch (error) {
    console.error("读取 latest-assets.json 失败", error);
    if (cachedAssets) {
      return cachedAssets;
    }
    // 默认值
    return {
      basePath: "/assets/",
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

  // 获取资源信息
  const assets = await getLatestAssets();

  // 构建完整的资源URL（保留原有逻辑）
  const bootstrapJs = assets.js ? `/${assets.js}` : "";
  const bootstrapCss = assets.css ? `/${assets.css}` : "";

  let didError = false;
  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage?.split(",")[0] || "zh-CN";

  try {
    const renderStartTime = performance.now();

    const stream = await renderToReadableStream(
      renderReactApp(store, url, hostname, lng),
      {
        bootstrapModules: bootstrapJs ? [bootstrapJs] : [],
        onError(error) {
          didError = true;
          console.error(error);
        },
      }
    );

    console.log(
      `Render to stream time: ${performance.now() - renderStartTime}ms`
    );

    const [reactStream, copyReactStream] = stream.tee();
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

    // 写入HTML头部
    const writeHeaderStartTime = performance.now();
    writer.write(new TextEncoder().encode(htmlStart(bootstrapCss)));
    console.log(
      `Write header time: ${performance.now() - writeHeaderStartTime}ms`
    );

    // 异步写入状态
    async function writeToStreamAsync() {
      const dispatchStartTime = performance.now();
      const preloadedState = store.getState();
      writer.write(new TextEncoder().encode(serializeState(preloadedState)));
      console.log(`Dispatch time: ${performance.now() - dispatchStartTime}ms`);
      doneLocal = true;
      tryCloseStream();
    }

    writeToStreamAsync();

    // 代理React流
    const proxyReactStream = async () => {
      const proxyStartTime = performance.now();
      writer.write(new TextEncoder().encode('<div id="root">'));

      const reader = copyReactStream.getReader();
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

      console.log(
        `Proxy React stream time: ${performance.now() - proxyStartTime}ms`
      );
    };

    proxyReactStream();

    return new Response(readable, {
      status: didError ? 500 : 200,
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    console.log(`Error handling time: ${performance.now() - startTime}ms`);

    return new Response(
      `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>错误</title>
      </head>
      <body>
        <h1>抱歉，服务器发生错误，请稍后重试</h1>
      </body>
      </html>`,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }
    );
  }
};
