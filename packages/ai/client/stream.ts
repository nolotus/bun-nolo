import { getLogger } from "utils/logger";

const streamLogger = getLogger("stream");

export async function readChunks(
  reader: ReadableStreamReader<Uint8Array>,
  onStreamData: (chunk: Uint8Array) => void,
): Promise<void> {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        streamLogger.info("Stream is done reading");
        break;
      }
      if (value) {
        streamLogger.info("Received a new chunk of size: %d", value.length);
        onStreamData(value);
      }
    }
  } catch (err) {
    streamLogger.error("An error occurred while reading the stream: %j", err);
  } finally {
    reader.releaseLock();
  }
}
