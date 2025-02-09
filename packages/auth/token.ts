import { detachedSign, verifyDetachedSignature } from "core/crypto";
import { Base64 } from "js-base64";

export const signToken = (payload: any, secretKey: string) => {
  const encodedPayload = Base64.encode(JSON.stringify(payload));
  const signature = detachedSign(encodedPayload, secretKey);
  return `${encodedPayload}.${signature}`;
};

export const verifyToken = (token: string, publicKey: string) => {
  const [encodedPayload, signature] = token.split(".");

  if (!verifyDetachedSignature(encodedPayload, signature, publicKey)) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(Base64.decode(encodedPayload));

  if (payload.exp && typeof payload.exp === "number") {
    if (Math.floor(Date.now() / 1000) > payload.exp) {
      throw new Error("Token has expired");
    }
  }

  return payload;
};

export const parseToken = (token: string) => {
  try {
    const [payloadBase64] = token.split(".");
    return JSON.parse(Base64.decode(payloadBase64));
  } catch {
    return null;
  }
};
