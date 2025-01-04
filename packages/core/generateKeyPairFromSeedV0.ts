import nacl from "tweetnacl";
import { base64UrlToUint8Array, uint8ArrayToBase64Url } from "./base64";

import { SHA3 } from "crypto-js";

export const generateHash = (data: string) => {
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

export const generateKeyPairFromSeedV0 = (seedData: string) => {
  const seed = generateHash(seedData);
  const keyPair = nacl.sign.keyPair.fromSeed(base64UrlToUint8Array(seed));
  return {
    publicKey: uint8ArrayToBase64Url(keyPair.publicKey),
    secretKey: uint8ArrayToBase64Url(keyPair.secretKey),
  };
};
