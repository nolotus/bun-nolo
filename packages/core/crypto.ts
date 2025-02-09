import nacl from "tweetnacl";
import { Base64 } from "js-base64";

export const signMessage = (
  message: string,
  secretKeyBase64: string
): string => {
  const messageUint8 = new TextEncoder().encode(message);
  const signedMessage = nacl.sign(
    messageUint8,
    Base64.toUint8Array(secretKeyBase64)
  );
  return Base64.fromUint8Array(signedMessage);
};

export const verifySignedMessage = (
  signedMessageBase64: string,
  publicKeyBase64: string
): string => {
  const message = nacl.sign.open(
    Base64.toUint8Array(signedMessageBase64),
    Base64.toUint8Array(publicKeyBase64)
  );

  if (!message) throw new Error("Decoding failed");
  return new TextDecoder().decode(message);
};

export const detachedSign = (message: string, secretKeyBase64: string) => {
  const signature = nacl.sign.detached(
    new TextEncoder().encode(message),
    Base64.toUint8Array(secretKeyBase64)
  );
  return Base64.fromUint8Array(signature, true);
};

export const verifyDetachedSignature = (
  message: string,
  signatureBase64: string,
  publicKeyBase64: string
): boolean => {
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      Base64.toUint8Array(signatureBase64),
      Base64.toUint8Array(publicKeyBase64)
    );
  } catch {
    return false;
  }
};
