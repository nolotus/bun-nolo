import { getLogger } from "utils/logger";

const streamLogger = getLogger("stream");

export async function readChunks(
  reader: ReadableStreamReader<Uint8Array>,
  onStreamData: (chunk: string) => void,
): Promise<void> {
  let value;
  try {
    while (true) {
      const result = await reader.read();
      value = result.value;
      if (result.done) {
        streamLogger.info("Stream is done reading");
        return;
      }
      if (value) {
        streamLogger.info("Received stream value", value);
        const text = new TextDecoder("utf-8").decode(value);
        streamLogger.info("Received stream", text);
        onStreamData(text);
      }
    }
  } catch (err) {
    streamLogger.error("An error occurred while reading the stream: %j", err);
    if (value) {
      // 输出出错时的原始数据
      streamLogger.error("Error occurred with stream value: %j", value);
    }
  } finally {
    reader.releaseLock();
  }
}
