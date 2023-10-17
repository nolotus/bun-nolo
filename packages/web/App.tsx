import React, { useMemo } from "react";
import { useRoutes } from "react-router-dom";
import { generatorRoutes } from "./generatorRoutes";
export default function App({ preloadState, hostname }) {
  const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  let element = useRoutes(routes);

  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.NOLO_STORE_DATA=${JSON.stringify(preloadState)}`,
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
