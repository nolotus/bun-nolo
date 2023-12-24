import { getLogger } from "utils/logger";

const validationLogger = getLogger("validation");

export function base64UrlEncode(inputStr: string): string {
	return btoa(String.fromCharCode(...new TextEncoder().encode(inputStr)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/[=]+$/, "");
}

export function base64UrlDecode(base64Url: string | undefined): string | null {
	if (!base64Url) {
		validationLogger.error("base64Url is undefined. Decoding aborted.");
		return null;
	}

	try {
		let paddedBase64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		while (paddedBase64.length % 4) {
			paddedBase64 += "=";
		}
		const decodedString = atob(paddedBase64);
		const uint8Array = new Uint8Array(decodedString.length);

		for (let i = 0; i < decodedString.length; i++) {
			uint8Array[i] = decodedString.charCodeAt(i);
		}

		const decodedUtf8String = new TextDecoder().decode(uint8Array);
		return decodedUtf8String;
	} catch (error) {
		validationLogger.error("Error occurred during base64Url decoding:", error);
		throw error;
	}
}
