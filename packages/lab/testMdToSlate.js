// 导入需要的库
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

// --- 从指定路径导入你的 mdastToSlate 函数 ---
// 注意：这里的路径 './create/editor/mdastToSlate.js' 是一个示例。
// 你需要根据你保存这个测试脚本的位置，相对于 'create/editor/mdastToSlate.js'
// 文件来调整这个相对路径。
// 同时，确认你的 mdastToSlate 文件是以 .js, .mjs, 或者你的 Node/TypeScript 环境能解析的扩展名结尾。
// 并且确认 mdastToSlate 是以命名导出的方式 (export function/const)
import { mdastToSlate } from 'create/editor/mdastToSlate.js';
// 如果你的 mdastToSlate 文件是默认导出 (export default), 则使用下面这行:
// import mdastToSlate from './create/editor/mdastToSlate.js';


// --- markdownToSlate 函数 (带日志) ---
function markdownToSlateWithLogging(markdown) {
  if (!markdown || typeof markdown !== "string") {
    console.log("输入不是有效的 Markdown 字符串，返回 null");
    return null;
  }

  console.log("--- 输入的 Markdown: ---");
  console.log(markdown);
  console.log("\n");

  const mdastTree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  console.log("--- 生成的 mdastTree: ---");
  console.log(JSON.stringify(mdastTree, null, 2));
  console.log("\n");

  console.log("--- 调用 mdastToSlate(mdastTree)... ---");
  try {
    const slateResult = mdastToSlate(mdastTree); // 使用导入的函数

    console.log("\n");
    console.log("--- mdastToSlate(mdastTree) 的最终结果: ---");
    console.log(JSON.stringify(slateResult, null, 2));

    return slateResult;
  } catch (error) {
    console.error("\n--- 调用 mdastToSlate 时发生错误: ---");
    console.error(error);
    return null; // 或者根据需要处理错误
  }
}

// --- 测试部分 ---
const testMarkdown = "在同步服务器时失败（或收到错误响应）。\n\n**客户端解决方案 (在 `spaceSlice.ts` 的 Thunks 中处理):**\n\n**方案一：在 `changeSpace` Thunk 中捕获并处理 `read";

// 执行函数并打印结果
markdownToSlateWithLogging(testMarkdown);

