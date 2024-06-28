import { getLogger } from "utils/logger";

const streamLogger = getLogger("stream");

export async function readChunks(
  reader: ReadableStreamReader<Uint8Array>,
  onStreamData: (chunk: string) => void,
): Promise<void> {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
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
  } finally {
    reader.releaseLock();
  }
}
