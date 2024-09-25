// runCybot.ts

import { runTest } from "./testCybot";

async function main() {
  console.log("正在启动HTTP测试工具...");
  await runTest();
}

main().catch((error) => {
  console.error("运行过程中发生错误:", error);
});
