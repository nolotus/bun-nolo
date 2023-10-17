import { App } from "web";
import React, { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { memCache } from "app";

export const handleRender = async (req) => {
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
