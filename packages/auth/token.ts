import { base64UrlDecode, base64UrlEncode } from "core/base64";
import { detachedSign, verifyDetachedSignature } from "core/crypto";

export const signToken = (payload: any, secretKeyBase64: string): string => {
  // Convert payload to a string then to base64Url
  const payloadStr = JSON.stringify(payload);
  const payloadBase64Url = base64UrlEncode(payloadStr);

  // Sign the payload
  const signature = detachedSign(payloadBase64Url, secretKeyBase64);

  // Create the token
  const token = `${payloadBase64Url}.${signature}`;

  return token;
};

export const verifyToken = (
  token: string,
  publicKeyBase64Url: string
): Record<string, any> | null => {
  const [payloadBase64Url, signatureBase64Url] = token.split(".");

  const isValid = verifyDetachedSignature(
    payloadBase64Url,
    signatureBase64Url,
    publicKeyBase64Url
  );

  if (!isValid) {
    return null;
  }

  const decodedPayload = base64UrlDecode(payloadBase64Url);

  if (!decodedPayload) {
    return null;
  }

  return JSON.parse(decodedPayload);
};

export const parseToken = (token: string) => {
  try {
    const [payloadBase64Url] = token.split(".");
    const decodedPayload = base64UrlDecode(payloadBase64Url);
    if (!decodedPayload) {
      return null;
    }
    const result = JSON.parse(decodedPayload);
    return result;
  } catch (error) {
    return null;
  }
};
