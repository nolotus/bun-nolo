import { SHA3 } from "crypto-js";
import nacl from "tweetnacl";
import { getLogger } from "utils/logger";
import { uint8ArrayToBase64Url, base64UrlToUint8Array } from "./base64";
import { toUint8Array } from "js-base64";
const cryptoLogger = getLogger("crypto");

export const generateHash = (data) => {
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

export const generateKeyPairFromSeed = (seedData) => {
	const seed = generateHash(seedData);
	const keyPair = nacl.sign.keyPair.fromSeed(base64UrlToUint8Array(seed));
	return {
		publicKey: uint8ArrayToBase64Url(keyPair.publicKey),
		secretKey: uint8ArrayToBase64Url(keyPair.secretKey),
	};
};

export const signMessage = (message, secretKeyBase64) => {
	const messageUint8 = new TextEncoder().encode(message);
	const signedMessage = nacl.sign(messageUint8, toUint8Array(secretKeyBase64));
	return uint8ArrayToBase64Url(new Uint8Array(signedMessage.buffer));
};

export const verifySignedMessage = (signedMessageBase64, publicKeyBase64) => {
	const signedMessage = base64UrlToUint8Array(signedMessageBase64);
	const message = nacl.sign.open(
		signedMessage,
		base64UrlToUint8Array(publicKeyBase64),
	);
	if (message == null) {
		throw new Error("Decoding failed, message is null");
	}
	return new TextDecoder().decode(message);
};

export const detachedSign = (message, secretKeyBase64Url) => {
	const messageUint8 = new TextEncoder().encode(message);
	const signature = nacl.sign.detached(
		messageUint8,
		base64UrlToUint8Array(secretKeyBase64Url),
	);
	return uint8ArrayToBase64Url(new Uint8Array(signature));
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
			base64UrlToUint8Array(signatureBase64Url),
			base64UrlToUint8Array(publicKeyBase64Url),
		);
	} catch (error) {
		return false;
	}
};
