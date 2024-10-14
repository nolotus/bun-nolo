import { AxiosResponse } from "axios";

export const createStreamResponse = async (stream: AxiosResponse<any>) => {
  const responseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  };

  let readableStream;
  if (stream.messages) {
    readableStream = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            for await (const chunk of stream) {
              const value = new TextEncoder().encode(JSON.stringify(chunk));
              controller.enqueue(value);
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        })();
      },
    });
  } else {
    readableStream = new ReadableStream({
      start(controller) {
        stream.data.on("data", (chunk) => {
          const value = new TextEncoder().encode(chunk.toString());
          controller.enqueue(value);
        });
        stream.data.on("end", () => {
          controller.close();
        });
        stream.data.on("error", (error) => {
          controller.error(error);
        });
      },
    });
  }

  return new Response(readableStream, { headers: responseHeaders });
};
