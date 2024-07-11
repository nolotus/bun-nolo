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
  // 启动 http 服务器
  Bun.serve({
    port: 80,
    hostname: "0.0.0.0",
    fetch: handleRequest,
    websocket: {
      // define websocket handlers
      async message(ws, message) {
        // the contextual dta is available as the `data` property
        // on the WebSocket instance
        ws.send(`Received`);
      },
    },
  });
  if (isProduction) {
    Bun.serve({
      port: 443,
      hostname: "0.0.0.0",
      fetch: handleRequest,
      websocket: {
        // define websocket handlers
        async message(ws, message) {
          // the contextual dta is available as the `data` property
          // on the WebSocket instance
          ws.send(`Received`);
        },
      },
      tls: {
        key: Bun.file("./key.pem"),
        cert: Bun.file("./cert.pem"),
      },
    });
  }
};

export const startServer = () => {
  console.log("start httpServer");
  httpServer();
  console.log("end httpServer");

  // startTasks();
};

startServer();
