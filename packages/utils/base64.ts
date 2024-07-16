import * as https from "https";
import * as path from "path";

export function getMediaTypeFromUrl(url: string): string {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return match ? match[1] : "application/octet-stream";
  }
  const ext = path.extname(url).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function convertUrlToBase64(url: string): Promise<string> {
  // 检查 URL 是否已经是 base64 格式
  if (url.startsWith("data:")) {
    return Promise.resolve(url.split(",")[1]);
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";
        response.setEncoding("base64");

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
