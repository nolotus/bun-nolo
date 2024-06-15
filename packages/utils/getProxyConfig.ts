export function getProxyConfig(isProxy?: boolean) {
  if (isProxy === false) {
    return;
  }
  if (isProxy || process.env.USE_PROXY === "true") {
    return {
      proxy: {
        protocol: "http",
        host: "127.0.0.1",
        port: 6152,
      },
    };
  }
}
