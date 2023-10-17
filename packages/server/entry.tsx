import React, { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { App } from "web";
import { memCache } from "app";

import { StaticRouter } from "react-router-dom/server";

// 共享请求处理函数
const handleRequest = async (req) => {
  const url = new URL(req.url);

  // 处理公共资源请求
  if (url.pathname.startsWith("/public")) {
    const file = url.pathname.replace("/public", "");
    return new Response(Bun.file(`public/${file}`));
  }

  // 渲染主应用页面
  try {
    return await handleRender(req);
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response("<h1>服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};

// 渲染函数
const handleRender = async (req) => {
  const url = new URL(req.url);
  let didError = false;
  const renderContent = Array.from(memCache, ([name, value]) => ({
    id: name,
    value,
  }));

  const Html = () => (
    <StaticRouter location={url}>
      <App preloadState={renderContent} hostname={req.host} />
    </StaticRouter>
  );

  try {
    const app = createElement(Html);
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ["/public/entry.js"],
      onError(error) {
        didError = true;
        console.error(`渲染错误: ${error}`);
      },
    });

    return new Response(stream, {
      status: didError ? 500 : 200,
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error(`处理请求时发生错误: ${error}`);
    return new Response("<h1>抱歉，服务器发生错误，请稍后重试</h1>", {
      status: 500,
      headers: { "content-type": "text/html" },
    });
  }
};

// 根据环境变量决定是否启动 https 服务器
if (process.env.ENV === "production") {
  Bun.serve({
    port: 443,
    hostname: "0.0.0.0",
    fetch: handleRequest,
    tls: {
      key: Bun.file("./key.pem"),
      cert: Bun.file("./cert.pem"),
      ca: Bun.file("./ca.pem"),
    },
  });
}

// 启动 http 服务器
Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});
