// keypair.ts
import nacl from "tweetnacl";
import { Base64 } from "js-base64";

export const generateKeyPairFromSeedV1 = (seedData: string) => {
  const seed = new TextEncoder().encode(seedData);
  const hashSeed = nacl.hash(seed);
  const seed32 = hashSeed.slice(0, 32);
  const keyPair = nacl.sign.keyPair.fromSeed(seed32);

  return {
    publicKey: Base64.fromUint8Array(keyPair.publicKey, true),
    secretKey: Base64.fromUint8Array(keyPair.secretKey, true),
  };
};
