export function generateErrorResponse(error) {
  console.error(error);
  return new Response(
    `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    },
  );
}
