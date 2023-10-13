import { renderToReadableStream } from "react-dom/server";
import {useMemo} from 'react'
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

import {renderMdastNode} from './renderMdastNode';
const example =Bun.file('example.txt')
const text = await example.text()
console.log(text);

function Component({content}) {
console.log('content',content)
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderMdastNode(mdast, '1');
  }, [mdast]);
  return (
    <html>
      <head>
      <meta charset="UTF-8"></meta>
      </head>
      <body>
{renderedContent}
    </body>
    </html>

  );
}

Bun.serve({
  async fetch() {
    const stream = await renderToReadableStream(
      <Component content={text} />
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html" },
    });
  },

  // Optional port number - the default value is 3000
  port: process.env.PORT || 4000,
});
