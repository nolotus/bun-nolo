import { getLogger } from "utils/logger";
import { Base64 } from "js-base64";
import { generateHash } from "./crypto";
import { Flags, setKeyPrefix } from "./prefix";

const cryptoLogger = getLogger("crypto");

export const generateIdWithHashId = (userId, data, flags) => {
  const idPrefix = setKeyPrefix(flags);
  const hashId = generateHash(data);
  return `${idPrefix}-${userId}-${hashId}`;
};

export const generateIdWithCustomId = (
  userId: string,
  customId: string,
  flags: object
) => {
  const idPrefix = setKeyPrefix(flags);
  return `${idPrefix}-${userId}-${customId}`;
};
export function generateCustomId(
  userId: string,
  customId: string,
  flags?: Flags
) {
  return generateIdWithCustomId(
    userId,
    customId,
    flags ? flags : { isJSON: true }
  );
}

export const generateKey = (
  data,
  userId: string,
  flags: Flags,
  customId: string
) => {
  flags.isHash = !customId;
  return customId
    ? generateIdWithCustomId(userId, customId, flags)
    : generateIdWithHashId(userId, data, flags);
};

export const generateUserId = (
  publicKey: string,
  username: string,
  language: string,
  extra: string = ""
) => {
  try {
    const text = publicKey + username + language + extra;
    cryptoLogger.info(`text: ${text}`);
    let userId = generateHash(text);
    cryptoLogger.info("before Base64 userId:", { userId });

    // 使用Base64 URL编码
    userId = Base64.btoa(userId)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/[=]+$/, "");

    cryptoLogger.info("Successfully generated unique userId.");
    cryptoLogger.info("userId:", { userId });
    return userId;
  } catch (error) {
    cryptoLogger.error("Error generating unique userId:", error);
    throw error;
  }
};
