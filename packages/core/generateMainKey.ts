import {setKeyPrefix} from './prefix';
import {getLogger} from 'utils/logger';
import {generateHash} from './crypto';

const cryptoLogger = getLogger('crypto');

export const generateIdWithHashId = (userId, data, flags) => {
  const idPrefix = setKeyPrefix(flags);
  const hashId = generateHash(data);
  return `${idPrefix}-${userId}-${hashId}`;
};

export const generateIdWithCustomId = (
  userId: string,
  customId: string,
  flags: object,
) => {
  const idPrefix = setKeyPrefix(flags);
  return `${idPrefix}-${userId}-${customId}`;
};

export const generateKey = (data, userId, flags, customId) => {
  flags.isHash = !customId;
  return customId
    ? generateIdWithCustomId(userId, customId, flags)
    : generateIdWithHashId(userId, data, flags);
};

export const generateUserId = (
  publicKey: string,
  username: string,
  language: string,
  extra: string = '',
) => {
  try {
    const text = publicKey + username + language + extra;
    cryptoLogger.info(`text: ${text}`);
    let userId = generateHash(text);

    // 使用Base64 URL编码
    userId = btoa(userId)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]+$/, '');

    cryptoLogger.info('Successfully generated unique userId.');

    cryptoLogger.info('userId:', {userId});
    return userId;
  } catch (error) {
    cryptoLogger.error('Error generating unique userId:', error);
    throw error;
  }
};
