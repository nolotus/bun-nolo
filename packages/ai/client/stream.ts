import { getLogger } from "utils/logger";

const streamLogger = getLogger("stream");

export function decodeChunk(value: Uint8Array): string {
  return new TextDecoder("utf-8").decode(value);
}

function handleStreamData(
  id: string,
  text: string,
  onStreamData: (id: string, chunk: string) => void,
) {
  onStreamData(id, text);
}

function logError(err: any) {
  console.error("Error type:", typeof err);
  console.error("Error details:", err);
  streamLogger.error("An error occurred while reading the stream:", err);
}

function attemptDecoding(value: Uint8Array) {
  try {
    const decodedText = decodeChunk(value);
    streamLogger.error(
      "Error occurred with stream value (decoded as text):",
      decodedText,
    );
  } catch (decodeError) {
    streamLogger.error(
      "Failed to decode using TextDecoder (text):",
      decodeError,
    );
  }

  try {
    const decodedJson = JSON.parse(new TextDecoder("utf-8").decode(value));
    streamLogger.error(
      "Error occurred with stream value (JSON decoded):",
      decodedJson,
    );
  } catch (jsonError) {
    streamLogger.error("Failed to decode JSON (text):", jsonError);
  }

  try {
    const base64 = btoa(String.fromCharCode(...value));
    streamLogger.error("Error occurred with stream value (base64):", base64);
  } catch (base64Error) {
    streamLogger.error("Failed to decode Base64:", base64Error);
  }

  try {
    const hex = Array.from(value)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    streamLogger.error("Error occurred with stream value (hex):", hex);
  } catch (hexError) {
    streamLogger.error("Failed to decode Hex:", hexError);
  }

  streamLogger.error("Raw Uint8Array value:", value);
}

function handleError(err: any, value?: Uint8Array) {
  logError(err);
  if (value) {
    attemptDecoding(value);
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
