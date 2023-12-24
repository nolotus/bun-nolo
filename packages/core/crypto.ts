import { SHA3 } from "crypto-js";
import nacl from "tweetnacl";
import { encodeURLSafe, decodeURLSafe } from "@stablelib/base64";

export const generateHash = (data) => {
	const hashWordArray = SHA3(data, { outputLength: 256 });

	const words = hashWordArray.words;
	const sigBytes = hashWordArray.sigBytes;
	const bytes = new Uint8Array(sigBytes);
	for (let i = 0; i < sigBytes; i++) {
		const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		bytes[i] = byte;
	}

	// 使用 @stablelib/base64 的 encode 函数
	const result = encodeURLSafe(bytes);

	return result;
};

export const generateKeyPairFromSeed = (seedData: string) => {
	const seed = generateHash(seedData);
	const seedArray = decodeURLSafe(seed);

	const keyPair = nacl.sign.keyPair.fromSeed(seedArray);

	return {
		publicKey: encodeURLSafe(keyPair.publicKey),
		secretKey: encodeURLSafe(keyPair.secretKey),
	};
};

export const signMessage = (message, secretKeyBase64) => {
	const messageUint8 = new TextEncoder().encode(message);
	const signedMessage = nacl.sign(messageUint8, decodeURLSafe(secretKeyBase64));
	return encodeURLSafe(new Uint8Array(signedMessage.buffer));
};

export const verifySignedMessage = (signedMessageBase64, publicKeyBase64) => {
	const signedMessage = decodeURLSafe(signedMessageBase64);
	const message = nacl.sign.open(signedMessage, decodeURLSafe(publicKeyBase64));
	if (message == null) {
		throw new Error("Decoding failed, message is null");
	}
	return new TextDecoder().decode(message);
};

export const detachedSign = (message, secretKeyBase64Url) => {
	const messageUint8 = new TextEncoder().encode(message);
	const signature = nacl.sign.detached(
		messageUint8,
		decodeURLSafe(secretKeyBase64Url),
	);
	return encodeURLSafe(new Uint8Array(signature));
};

export const verifyDetachedSignature = (
	message,
	signatureBase64Url,
	publicKeyBase64Url,
) => {
	try {
		const messageUint8 = new TextEncoder().encode(message);
		return nacl.sign.detached.verify(
			messageUint8,
			decodeURLSafe(signatureBase64Url),
			decodeURLSafe(publicKeyBase64Url),
		);
	} catch (error) {
		return false;
	}
};
