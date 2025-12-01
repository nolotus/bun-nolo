// handlers/applyDiffHandler.ts

import { applyPatch } from "diff";
import path from "path";
import { file as bunFile, write as bunWrite } from "bun"; // ✅ 显式导入 Bun API

interface ApplyDiffRequestBody {
  filePath: string; // 相对项目根目录的路径，比如 "src/index.ts"
  diff: string; // unified diff / git diff 格式的补丁文本
}

// 约定一个项目根目录，防止路径逃逸
const PROJECT_ROOT =
  process.env.PROJECT_ROOT /* 可通过环境变量指定项目根 */ ??
  process.cwd(); /* 默认使用当前工作目录 */

/**
 * 解析并校验 filePath，确保不会跳出 PROJECT_ROOT
 */
function resolveSafePath(filePath: string): string {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid filePath");
  }

  // 一些简单防御：禁止空字符等
  if (filePath.includes("\0")) {
    throw new Error("Invalid filePath");
  }

  // 计算绝对路径，并归一化
  const absPath = path.resolve(PROJECT_ROOT, filePath);

  // 防止 ../ 跑出项目根目录
  if (!absPath.startsWith(PROJECT_ROOT)) {
    throw new Error("filePath is outside of project root");
  }

  return absPath;
}

export async function handleApplyDiff(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as Partial<ApplyDiffRequestBody>;

    if (!body.filePath || !body.diff) {
      return new Response(
        JSON.stringify({
          error: "filePath and diff are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const targetPath = resolveSafePath(body.filePath);

    // 读原文件内容
    let originalText: string;
    try {
      originalText = await bunFile(targetPath).text();
    } catch (e) {
      console.error("[handleApplyDiff] read file error:", e);
      return new Response(
        JSON.stringify({
          error: `File not found or cannot be read: ${body.filePath}`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 把 diff 应用到原文本上
    const patched = applyPatch(originalText, body.diff);

    if (patched === false) {
      // applyPatch 返回 false 说明补丁应用失败（行号/上下文不匹配等）
      return new Response(
        JSON.stringify({
          error: "Failed to apply diff, please check diff format and context",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 写回文件
    await bunWrite(targetPath, patched);

    return new Response(
      JSON.stringify({
        success: true,
        filePath: body.filePath,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e: any) {
    console.error("[handleApplyDiff] unexpected error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
