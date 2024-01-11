import { SHA3 } from "crypto-js";
import nacl from "tweetnacl";
import { getLogger } from "utils/logger";
import { uint8ArrayToBase64Url, base64UrlToUint8Array } from "./base64";
import { fromUint8Array, toUint8Array } from "js-base64";
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

/**
 * 使用给定的密钥对消息进行签名
 *
 * @param {string} message - 要签名的消息
 * @param {string} secretKeyBase64 - base64 编码的密钥，由 tweetnaclgh生成
 * @returns {string} - 签名后的消息
 */
export const signMessage = (
	message: string,
	secretKeyBase64: string,
): string => {
	const messageUint8: Uint8Array = new TextEncoder().encode(message);
	const signedMessage: Uint8Array = nacl.sign(
		messageUint8,
		toUint8Array(secretKeyBase64),
	);
	return fromUint8Array(signedMessage);
};

/**
 * 验证已签名的消息并解码
 *
 * @param {string} signedMessageBase64 - base64 编码的已签名消息
 * @param {string} publicKeyBase64 - base64 编码的公钥
 * @returns {string} - 解码后的消息
 * @throws {Error} - 当解码失败时抛出异常
 */
export const verifySignedMessage = (
	signedMessageBase64: string,
	publicKeyBase64: string,
): string => {
	const signedMessage: Uint8Array = toUint8Array(signedMessageBase64);
	const message: Uint8Array | null = nacl.sign.open(
		signedMessage,
		toUint8Array(publicKeyBase64),
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
