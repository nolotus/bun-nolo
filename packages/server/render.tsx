import { store } from "app/store";
import { renderToReadableStream } from "react-dom/server";
import { renderReactApp } from "./html/renderReactApp";
import { serializeState } from "./html/serializeState";
import { htmlEnd, htmlStart } from "./html/template";

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
    // 如果没有缓存，提供一个默认值或抛出错误
    return { js: "", css: "" }; // 默认值作为备用
  }
};

export const handleRender = async (req) => {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);

  const startTime = performance.now();

  // 获取最新的 assets 数据
  const assets = await getLatestAssets();
  const bootstrapJs = assets.js ? `/${assets.js}` : "";
  const bootstrapCss = assets.css ? `/${assets.css}` : "";
  let didError = false;

  const acceptLanguage = req.headers.get("accept-language");
  const lng = acceptLanguage.split(",")[0];

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
    writer.write(new TextEncoder().encode(htmlStart(bootstrapCss)));
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
      console.log(`Dispatch time: ${performance.now() - dispatchStartTime}ms`);

      const preloadedState = store.getState();
      writer.write(new TextEncoder().encode(serializeState(preloadedState)));
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
      `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
        <title>错误</title>
      </head>
      <body>
        <h1>抱歉，服务器发生错误，请稍后重试</h1>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }
    );
  }
};
