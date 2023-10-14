import React, { useState, useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { renderMdastNode } from "./renderMdastNode";

export default function App({ context }) {
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
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{renderedContent}</body>
    </html>
  );
}
