import { describe, it, expect } from 'bun:test';

import {
  setKeyPrefix,
  decodeKeyPrefix,
  isHash,
  isString,
  isBase64,
  isUrlSafe,
  getDecodedFlag,
} from './prefix';
describe('Key Prefix utilities', () => {
  it('should correctly decode a prefix into flags with new flag', () => {
    const prefix = '101010111';
    const decodedFlags = decodeKeyPrefix(prefix);
    expect(decodedFlags).toEqual({
      isHash: true,
      isVersion: false,
      isList: true,
      isObject: false,
      isString: true,
      isBase64: false,
      isJSON: true,
      isUrlSafe: true,
      isOthersWritable: true, // 新增的标志
    });
  });

  it('should correctly determine if a prefix represents a hash', () => {
    const prefix = '10000000';
    expect(isHash(prefix)).toBe(true);
  });

  it('should correctly determine if a prefix represents a string', () => {
    const prefix = '00001000';
    expect(isString(prefix)).toBe(true);
  });

  it('should correctly determine if a prefix represents base64', () => {
    const prefix = '00000100';
    expect(isBase64(prefix)).toBe(true);
  });

  it('should correctly determine if a prefix is URL safe', () => {
    const prefix = '00000001';
    expect(isUrlSafe(prefix)).toBe(true);
  });

  it('should correctly determine if a prefix represents others writable', () => {
    const prefix = '000000001';
    expect(getDecodedFlag(prefix, 'isOthersWritable')).toBe(true);
  });
  it('should correctly encode flags into a prefix with new flags', () => {
    const flags = {
      isHash: true,
      isVersion: false,
      isList: true,
      isObject: false,
      isString: true,
      isBase64: false,
      isJSON: true,
      isUrlSafe: true,
      isOthersWritable: true,
      isReadableByOthers: true, // 新增的标志
    };
    const prefix = setKeyPrefix(flags);
    expect(prefix).toBe('101010111100'); // 注意：现在有10个标志
  });

  it('should correctly decode a prefix into flags with new flags', () => {
    const prefix = '1010101111'; // 注意：现在有10个标志
    const decodedFlags = decodeKeyPrefix(prefix);
    expect(decodedFlags).toEqual({
      isHash: true,
      isVersion: false,
      isList: true,
      isObject: false,
      isString: true,
      isBase64: false,
      isJSON: true,
      isUrlSafe: true,
      isOthersWritable: true,
      isReadableByOthers: true, // 新增的标志
    });
  });

  it('should correctly determine if a prefix represents readable by others', () => {
    const prefix = '0000000001';
    expect(getDecodedFlag(prefix, 'isReadableByOthers')).toBe(true);
  });
});
