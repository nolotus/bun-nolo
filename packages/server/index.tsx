import { createElement } from "react";

import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'
import { renderToReadableStream } from 'react-dom/server'
import App from '../../App'
import { readFile } from "../database/read";

await Bun.build({
    entrypoints: ['./packages/web/index.tsx'],
    outdir: './public',
  });
  
  const text =await readFile()
const app = new Elysia()
  .use(staticPlugin())
  .get('/', async () => {

    // create our react App component
    const app = createElement(App,{context:{text}})

    // render the app component to a readable stream
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ['/public/index.js']
    })

    // output the stream as the response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    })
  })
  .listen(3000)