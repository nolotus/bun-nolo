export function handlePublicRequest(url: URL): Response {
  const filePath = url.pathname.replace("/public", "");
  // 检查是不是运行于Bun环境以使用Bun的文件API
  if (typeof Bun !== "undefined" && Bun.file) {
    const file = Bun.file(`public${filePath}`);
    const headers = new Headers({
      "Cache-Control": "max-age=3600",
      "Content-Type": file.type,
    });
    return new Response(file.stream(), { headers });
  }
  throw new Error("Bun.file is not available");
}
