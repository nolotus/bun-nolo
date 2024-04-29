import { serve } from "bun";
import { isProduction } from "utils/env";
import { handleRequest } from "./request";
import { Cron } from "croner";
import { tasks } from "./tasks";

const startTasks = () => {
  tasks.forEach(({ interval, task }) => {
    const cron = Cron(interval, task);
    cron.trigger();
  });
};

const httpServer = () => {
  if (isProduction) {
    serve({
      port: 443,
      hostname: "0.0.0.0",
      fetch: handleRequest,
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
      },
    });
  }

  // 启动 http 服务器
  serve({
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest,
  });
};

export const startServer = () => {
  console.log("start httpServer");
  httpServer();
  console.log("end httpServer");

  // startTasks();
};

startServer();
