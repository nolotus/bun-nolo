import { Base64 } from "js-base64";
import nacl from "tweetnacl";
import { FLAGS_MAP } from "./flagsMap";

import { generateHash } from "./generateKeyPairFromSeedV0";

const DEFAULT_LENGTH = Math.max(...Object.keys(FLAGS_MAP).map(Number));

const setKeyPrefix = (flags = {}): string => {
  const lengthFlags = FLAGS_MAP[DEFAULT_LENGTH];
  if (!lengthFlags) {
    throw new Error(`No flags defined for prefix of length ${DEFAULT_LENGTH}`);
  }
  return lengthFlags.map((flag) => Number(flags[flag] || false)).join("");
};
export const generateIdWithCustomId = (
  userId: string,
  customId: string,
  flags: object
) => {
  const idPrefix = setKeyPrefix(flags);
  return `${idPrefix}-${userId}-${customId}`;
};

export const generateUserIdV1 = (
  publicKey: string,
  username: string,
  language: string,
  extra: string = ""
) => {
  const text = publicKey + username + language + extra;
  const encodedText = new TextEncoder().encode(text);
  const hash = nacl.hash(encodedText);

  // 方案1：使用Array.from和map
  const hexString = Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 方案2：更简洁的写法，用Uint8Array直接转
  // const hexString = [...hash].map(x => x.toString(16).padStart(2,'0')).join('');

  console.log("Hex string:", hexString);
  return hexString.slice(0, 10);
};

export const generateUserIdV0 = (
  publicKey: string,
  username: string,
  language: string,
  extra: string = ""
) => {
  try {
    const text = publicKey + username + language + extra;
    console.log(`text: ${text}`);
    let userId = generateHash(text);
    console.log("before Base64 userId:", { userId });

    // 使用Base64 URL编码
    userId = Base64.btoa(userId)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/[=]+$/, "");

    console.log("Successfully generated unique userId.");
    console.log("userId:", { userId });
    return userId;
  } catch (error) {
    throw error;
  }
};
