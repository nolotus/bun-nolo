export function decodeChunk(value: Uint8Array): string {
	return new TextDecoder("utf-8").decode(value);
}
