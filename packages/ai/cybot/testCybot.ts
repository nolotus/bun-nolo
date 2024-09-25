// testCybot.ts

import readline from "readline";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 类型定义
type Message = {
  type: string;
  content: any;
};

type HttpRequest = {
  url: string;
  method: string;
  params?: Record<string, string>;
  data?: any;
  headers?: Record<string, string>;
};

type HttpResponse = {
  text: string;
  status: number;
};

// 解析用户输入
async function parseRequest(input: string): Promise<HttpRequest> {
  // 简单的解析逻辑，可以根据需要扩展
  const [method, url] = input.split(" ");
  return { method, url };
}

// 执行 HTTP 请求
async function invokeRequest(request: HttpRequest): Promise<HttpResponse> {
  const curlCommand = `curl -X ${request.method} "${request.url}" -i -s`;

  try {
    const { stdout } = await execAsync(curlCommand);
    const [headers, body] = stdout.split("\r\n\r\n");
    const statusLine = headers.split("\n")[0];
    const status = parseInt(statusLine.split(" ")[1]);

    return { text: body || "", status };
  } catch (error) {
    console.error("Error executing curl command:", error);
    return { text: "Error executing request", status: 500 };
  }
}

// 评估响应
async function evaluateResponse(response: HttpResponse): Promise<string> {
  // 简单的评估逻辑，可以根据需要扩展
  if (response.status >= 200 && response.status < 300) {
    return "请求成功。响应看起来正常。";
  } else if (response.status >= 400 && response.status < 500) {
    return "请求失败。可能是客户端错误，请检查您的请求。";
  } else if (response.status >= 500) {
    return "请求失败。服务器端错误，请稍后再试。";
  } else {
    return "未知状态码。请检查响应详情。";
  }
}

// 处理消息
async function processMessage(message: Message): Promise<Message> {
  if (message.type !== "HTTP_TEST") {
    throw new Error("Unsupported message type");
  }

  const request = await parseRequest(message.content);
  const response = await invokeRequest(request);
  const evaluation = await evaluateResponse(response);

  return {
    type: "TEST_RESULT",
    content: {
      request: request,
      response: response,
      evaluation: evaluation,
    },
  };
}

// 主函数，可以被外部调用
export async function runTest() {
  console.log("欢迎使用HTTP测试工具!");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await new Promise<string>((resolve) => {
      rl.question(
        "请输入HTTP请求 (例如: GET https://api.example.com, 或输入'exit'退出): ",
        resolve,
      );
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("谢谢使用，再见!");
      rl.close();
      break;
    }

    try {
      const inputMessage: Message = {
        type: "HTTP_TEST",
        content: userInput,
      };

      const resultMessage = await processMessage(inputMessage);
      console.log("\n测试结果:");
      console.log("请求:", resultMessage.content.request);
      console.log("响应状态码:", resultMessage.content.response.status);
      console.log("响应内容:", resultMessage.content.response.text);
      console.log("评估:", resultMessage.content.evaluation);
      console.log("\n");
    } catch (error) {
      console.error("错误:", error);
    }
  }
}

// 如果直接运行此脚本，则执行runTest函数
if (require.main === module) {
  runTest();
}
