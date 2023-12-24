// // Stablelib's supposed encode function for UTF-8 to base-64.
// // This is a placeholder since stablelib's actual base-64 function may vary.
// function stablelibBase64Encode(utf8String) {
// 	// Imagine this function properly encodes a UTF-8 string to base-64.
// 	// You would replace this with the actual stablelib function.
// 	return Buffer.from(utf8String).toString("base64");
// }

// // Test function to compare btoa() with stablelib's base-64 encoding.
// function testBase64Encoding(string) {
// 	// First, encode the string to UTF-8 using encodeURIComponent
// 	// and escape function to get the percent-encoded UTF-8 string.
// 	const utf8String = unescape(encodeURIComponent(string));

// 	// Use the built-in btoa() function to encode base-64.
// 	const btoaEncoded = btoa(utf8String);

// 	// Use the stablelib base-64 encode function.
// 	const stablelibEncoded = stablelibBase64Encode(utf8String);

// 	// Now we log the results for comparison.
// 	console.log("btoa encoded:", btoaEncoded);
// 	console.log("Stablelib encoded:", stablelibEncoded);

// 	// Check if the encoded results are the same.
// 	const areEqual = btoaEncoded === stablelibEncoded;
// 	console.log("Are the base-64 encoded strings equal?:", areEqual);
// }

// // Example usage
// testBase64Encoding(
// 	"Ns1SCm26aG_uPCR2dsO4LYvpwaY6J2VBhyYT9QPQ3wc=nolotuszh-CN undefined",
// );

// import { SHA3 } from "crypto-js";
// import { encodeURLSafe } from "@stablelib/base64";

// // Function using custom base64 URL encoding
// export const generateHashCustom = (data) => {
// 	const hashWordArray = SHA3(data, { outputLength: 256 });
// 	const words = hashWordArray.words;
// 	const sigBytes = hashWordArray.sigBytes;
// 	const bytes = new Uint8Array(sigBytes);

// 	// Convert words to bytes
// 	for (let i = 0; i < sigBytes; i++) {
// 		const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
// 		bytes[i] = byte;
// 	}

// 	// Custom base64 URL encoding
// 	const base64 = btoa(String.fromCharCode.apply(null, bytes));
// 	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/[=]+$/, "");
// };

// // Function using Stablelib's base64 URL encoding
// export const generateHashStablelib = (data) => {
// 	const hashWordArray = SHA3(data, { outputLength: 256 });
// 	const words = hashWordArray.words;
// 	const sigBytes = hashWordArray.sigBytes;
// 	const bytes = new Uint8Array(sigBytes);

// 	// Convert words to bytes
// 	for (let i = 0; i < sigBytes; i++) {
// 		const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
// 		bytes[i] = byte;
// 	}

// 	// Use Stablelib base64 URL encoding
// 	return encodeURLSafe(bytes);
// };

// // Test function to compare outputs from both generateHash functions
// export const testGenerateHashFunctions = (data) => {
// 	const customHash = generateHashCustom(data);
// 	const stablelibHash = generateHashStablelib(data);

// 	console.log("Custom Base64 URL:", customHash);
// 	console.log("Stablelib Base64 URL:", stablelibHash);
// 	console.log("Are the hashes equal?:", customHash === stablelibHash);
// };

// // Example usage of the test function
// testGenerateHashFunctions(
// 	"Ns1SCm26aG_uPCR2dsO4LYvpwaY6J2VBhyYT9QPQ3wcnolotuszh-CN undefined",
// );

import { fromUint8Array, toUint8Array, btoa as Nbtoa } from "js-base64";
import nacl from "tweetnacl";
import { SHA3 } from "crypto-js";
const seedData =
	"nolotus$argon2id$v=19$m=1024,t=1,p=1$bm9sb3R1c1RoZSBnb29kbmVzcyBvciBiYWRuZXNzIG9mIHRoaXMgd29ybGQgY29uY2VybnMgZXZlcnkgaW5kaXZpZHVhbC4$rvXHF+pPPOuIuAhkjjE06xwXCBQKc74H3ej3+WR7z80zh-CN";
export const base64UrlToUint8Array = (base64Url) => {
	let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4) {
		base64 += "=";
	}
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
};
export const uint8ArrayToBase64Url = (array) => {
	const base64 = btoa(String.fromCharCode.apply(null, array));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/[=]+$/, "");
};
export const oldGenerateHash = (data) => {
	const hashWordArray = SHA3(data, { outputLength: 256 });
	const words = hashWordArray.words;
	const sigBytes = hashWordArray.sigBytes;
	const bytes = new Uint8Array(sigBytes);
	for (let i = 0; i < sigBytes; i++) {
		const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		bytes[i] = byte;
	}
	return uint8ArrayToBase64Url(bytes);
};
export const newGenerateHash = (data) => {
	const hashWordArray = SHA3(data, { outputLength: 256 });

	const words = hashWordArray.words;
	const sigBytes = hashWordArray.sigBytes;
	const bytes = new Uint8Array(sigBytes);
	for (let i = 0; i < sigBytes; i++) {
		const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		bytes[i] = byte;
	}

	// 使用 @stablelib/base64 的 encode 函数
	const result = fromUint8Array(bytes);

	return result;
};

export const oldGenerateKeyPairFromSeed = (seedData: string) => {
	const seed = oldGenerateHash(seedData);
	const keyPair = nacl.sign.keyPair.fromSeed(base64UrlToUint8Array(seed));
	return {
		publicKey: uint8ArrayToBase64Url(keyPair.publicKey),
		secretKey: uint8ArrayToBase64Url(keyPair.secretKey),
	};
};

export const newGenerateKeyPairFromSeed = (seedData: string) => {
	const seed = newGenerateHash(seedData);
	const seedArray = toUint8Array(seed);

	const keyPair = nacl.sign.keyPair.fromSeed(seedArray);

	return {
		publicKey: fromUint8Array(keyPair.publicKey, true),
		secretKey: fromUint8Array(keyPair.secretKey, true),
	};
};
const oldPublicKey = oldGenerateKeyPairFromSeed(seedData);
const newPublicKey = newGenerateKeyPairFromSeed(seedData);

console.log("oldPublicKey", oldPublicKey);
console.log("newPublicKey", newPublicKey);

export const oldGenerateUserId = (
	publicKey: string,
	username: string,
	language: string,
	extra: string = "",
) => {
	try {
		const text = publicKey + username + language + extra;
		let userId = oldGenerateHash(text);

		// 使用Base64 URL编码
		userId = btoa(userId)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/[=]+$/, "");

		return userId;
	} catch (error) {
		throw error;
	}
};

export const newGenerateUserId = (
	publicKey: string,
	username: string,
	language: string,
	extra: string = "",
) => {
	try {
		const text = publicKey + username + language + extra;
		let userId = newGenerateHash(text);

		// 使用 stablelib 的 base64 编码
		userId = encodeURI(userId)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/[=]+$/, "");

		return userId;
	} catch (error) {
		throw error;
	}
};

const oldUserId = oldGenerateUserId(oldPublicKey, "nolotus", "zh-CN");
const newUserId = newGenerateUserId(newPublicKey, "nolotus", "zh-CN");
console.log("oldUserId", oldUserId);

console.log("newUserID", newUserId);
