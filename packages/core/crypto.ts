import nacl from "tweetnacl";
import { uint8ArrayToBase64Url, base64UrlToUint8Array } from "./base64";
import { fromUint8Array, toUint8Array } from "js-base64";
import { Buffer } from "buffer";

export const generateKeyPairFromSeedV1 = (seedData: string) => {
  const seed = new TextEncoder().encode(seedData);

  const hashSeed = nacl.hash(seed);

  // 只取哈希后的前32字节
  const seed32 = hashSeed.slice(0, 32);

  const keyPair = nacl.sign.keyPair.fromSeed(seed32);

  const result = {
    publicKey: uint8ArrayToBase64Url(keyPair.publicKey),
    secretKey: uint8ArrayToBase64Url(keyPair.secretKey),
  };

  return result;
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
  secretKeyBase64: string
): string => {
  const messageUint8: Uint8Array = new TextEncoder().encode(message);
  const signedMessage: Uint8Array = nacl.sign(
    messageUint8,
    toUint8Array(secretKeyBase64)
  );
  return fromUint8Array(signedMessage);
};

/**
 * 验证已签名的消息并解码。使用 Buffer 处理编码，完整支持所有 Unicode 字符。
 * 适用于 React Native 环境，面向全球用户。
 *
 * @param {string} signedMessageBase64 - base64 编码的已签名消息
 * @param {string} publicKeyBase64 - base64 编码的公钥
 * @returns {string} - 解码后的消息
 * @throws {Error} - 当解码失败时抛出异常
 */
export const verifySignedMessage = (
  signedMessageBase64: string,
  publicKeyBase64: string
): string => {
  const signedMessage: Uint8Array = toUint8Array(signedMessageBase64);

  try {
    const message: Uint8Array | null = nacl.sign.open(
      signedMessage,
      toUint8Array(publicKeyBase64)
    );

    if (message == null) {
      throw new Error("Decoding failed, message is null");
    }

    return Buffer.from(message).toString("utf8");
  } catch (error) {
    throw error;
  }
};

export const detachedSign = (message, secretKeyBase64Url) => {
  const messageUint8 = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(
    messageUint8,
    base64UrlToUint8Array(secretKeyBase64Url)
  );
  return uint8ArrayToBase64Url(new Uint8Array(signature));
};

export const verifyDetachedSignature = (
  message,
  signatureBase64Url,
  publicKeyBase64Url
) => {
  try {
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(
      messageUint8,
      base64UrlToUint8Array(signatureBase64Url),
      base64UrlToUint8Array(publicKeyBase64Url)
    );
  } catch (error) {
    return false;
  }
};
