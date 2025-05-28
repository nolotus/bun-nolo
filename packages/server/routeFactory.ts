// routeFactory.ts
export const createRouteConfig = (config) => {
  const {
    path,
    handlers,
    allowedMethods = ["GET", "OPTIONS"],
    enableCors = false,
  } = config;
  const route = { ...handlers };

  // 仅在需要 CORS 时添加 OPTIONS 处理
  if (enableCors && allowedMethods.length > 0) {
    route.OPTIONS = () =>
      new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": allowedMethods.join(", "),
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
  }

  return {
    path,
    route,
  };
};
