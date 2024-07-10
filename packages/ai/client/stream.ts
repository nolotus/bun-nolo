import { getLogger } from "utils/logger";

const streamLogger = getLogger("stream");

function decodeChunk(value: Uint8Array): string {
  return new TextDecoder("utf-8").decode(value);
}

function handleStreamData(
  id: string,
  text: string,
  onStreamData: (id: string, chunk: string) => void,
) {
  streamLogger.info("Received stream x", text);
  onStreamData(id, text);
}

function handleStreamEnd() {
  streamLogger.info("Stream is done reading");
}

function handleError(err: any, value: Uint8Array | undefined) {
  // 打印错误的类型和详细内容
  console.error("Error type:", typeof err);
  console.error("Error details:", err);

  // 临时简化日志格式
  streamLogger.error("An error occurred while reading the stream:", err);

  if (value) {
    streamLogger.error("Error occurred with stream value:", value);
  }
}

export async function readChunks(
  { reader, id }: { reader: ReadableStreamDefaultReader; id: string },
  onStreamData: (id: string, chunk: string) => void,
): Promise<void> {
  let value: Uint8Array | undefined;
  try {
    while (true) {
      const result = await reader.read();
      value = result.value;
      if (result.done) {
        handleStreamEnd();
        return;
      }
      if (value) {
        const text = decodeChunk(value);
        handleStreamData(id, text, onStreamData);
      }
    }
  } catch (err) {
    handleError(err, value);
  } finally {
    reader.releaseLock();
  }
}
