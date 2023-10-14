import React, { useState, useMemo } from "react";
import { useRoutes } from "react-router-dom";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { renderMdastNode } from "./renderMdastNode";
import { generatorRoutes } from "./generatorRoutes";

export default function App({ context, hostname }) {
  const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  let element = useRoutes(routes);

  const text = context.text;
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(text);
  }, [text]);
  const renderedContent = useMemo(() => {
    return renderMdastNode(mdast, "1");
  }, [mdast]);

  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.NOLO_STORE_DATA=${JSON.stringify(text)}`,
          }}
        ></script>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="/public/output.css"></link>
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{element}</body>
    </html>
  );
}
