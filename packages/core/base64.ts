import { getLogger } from "utils/logger";
import { Base64 } from "js-base64";

const validationLogger = getLogger("validation");

export function base64UrlEncode(inputStr: string): string {
	return Base64.btoa(String.fromCharCode(...new TextEncoder().encode(inputStr)))
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
		const decodedString = Base64.atob(paddedBase64);
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

export const base64UrlToUint8Array = (base64Url) => {
	let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4) {
		base64 += "=";
	}
	const binaryString = Base64.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
};

export const uint8ArrayToBase64Url = (array) => {
	const base64 = Base64.btoa(String.fromCharCode.apply(null, array));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/[=]+$/, "");
};
