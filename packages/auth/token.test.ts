import { signToken, verifyToken, parseToken } from "./token";
import { describe, test, expect } from "bun:test";
import { generateKeyPairFromSeedV1 } from "core/generateKeyPairFromSeedV1";

describe("Token Management Tests", () => {
  const seedData = "test-seed-123";
  const keyPair = generateKeyPairFromSeedV1(seedData);

  const payload = {
    username: "中文测试",
    userId: "0d6a321acf",
    publicKey: "fZYYyQby6_CdTBKGAuRDvyWY_rniNCufwOxc-FCHkXw",
  };

  describe("Sign and Verify Token Tests", () => {
    test("Sign and verify token with Chinese characters", () => {
      const token = signToken(payload, keyPair.secretKey);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token, keyPair.publicKey);
      expect(decoded).toEqual(payload);
      expect(decoded.username).toBe("中文测试");
    });

    test("Failed verification tests", () => {
      const token = signToken(payload, keyPair.secretKey);
      const wrongKeyPair = generateKeyPairFromSeedV1("wrong-seed");

      expect(() => {
        verifyToken(token, wrongKeyPair.publicKey);
      }).toThrow();

      const tamperedToken = token + "tampered";
      expect(() => {
        verifyToken(tamperedToken, keyPair.publicKey);
      }).toThrow();
    });

    test("Token with various Chinese characters", () => {
      const specialPayload = {
        ...payload,
        username: "特殊字符测试！@#￥%……&*（）",
      };

      const token = signToken(specialPayload, keyPair.secretKey);
      const decoded = verifyToken(token, keyPair.publicKey);

      expect(decoded).toEqual(specialPayload);
      expect(decoded.username).toBe("特殊字符测试！@#￥%……&*（）");
    });

    test("Token expiration verification", () => {
      const expiredPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) - 3600,
      };

      const validPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const expiredToken = signToken(expiredPayload, keyPair.secretKey);
      expect(() => {
        verifyToken(expiredToken, keyPair.publicKey);
      }).toThrow("Token has expired");

      const validToken = signToken(validPayload, keyPair.secretKey);
      const decoded = verifyToken(validToken, keyPair.publicKey);
      expect(decoded).toEqual(validPayload);
    });

    test("Token format validation", () => {
      expect(() => {
        verifyToken("", keyPair.publicKey);
      }).toThrow();

      expect(() => {
        verifyToken("invalid.token.format", keyPair.publicKey);
      }).toThrow();

      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        "base64"
      );
      expect(() => {
        verifyToken(encodedPayload, keyPair.publicKey);
      }).toThrow();

      const invalidJsonToken = `${Buffer.from("invalid json").toString("base64")}.signature`;
      expect(() => {
        verifyToken(invalidJsonToken, keyPair.publicKey);
      }).toThrow();
    });
  });

  describe("Parse Token Tests", () => {
    test("Successfully parse valid token", () => {
      const token = signToken(payload, keyPair.secretKey);
      const parsed = parseToken(token);
      expect(parsed).toEqual(payload);
    });

    test("Parse token with special data types", () => {
      const specialPayload = {
        nullValue: null,
        booleanValue: true,
        numberValue: 12345,
        arrayValue: [1, 2, 3],
        nestedObject: { key: "value" },
        emptyString: "",
        undefinedValue: undefined,
      };

      const token = signToken(specialPayload, keyPair.secretKey);
      const parsed = parseToken(token);
      expect(parsed).toEqual(specialPayload);
    });

    test("Handle invalid token formats", () => {
      expect(parseToken("")).toBeNull();
      expect(parseToken(undefined as any)).toBeNull();
      expect(parseToken({} as any)).toBeNull();
      expect(parseToken("invalid.token")).toBeNull();
      expect(parseToken("invalid_base64!@#$%^&*.signature")).toBeNull();
    });

    test("Parse token with Unicode characters", () => {
      const unicodePayload = {
        emoji: "🎉🌟👍",
        special: "©®™",
        mixed: "Hello世界",
        symbols: "∑∏∆∇",
      };

      const token = signToken(unicodePayload, keyPair.secretKey);
      const parsed = parseToken(token);
      expect(parsed).toEqual(unicodePayload);
    });
  });
});
