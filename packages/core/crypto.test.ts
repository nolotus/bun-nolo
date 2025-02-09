import {
  signMessage,
  verifySignedMessage,
  detachedSign,
  verifyDetachedSignature,
} from "./crypto";
import { generateKeyPairFromSeedV1 } from "core/crypto";
import { describe, beforeAll, test, expect } from "bun:test";

describe("Crypto Message Tests", () => {
  const seedData = "test-seed-123";
  const message = JSON.stringify({
    username: "中文12",
    userId: "0d6a321acf",
    publicKey: "fZYYyQby6_CdTBKGAuRDvyWY_rniNCufwOxc-FCHkXw",
  });

  let keyPair: {
    publicKey: string;
    secretKey: string;
  };

  beforeAll(() => {
    keyPair = generateKeyPairFromSeedV1(seedData);
  });

  test("Sign and verify message test", () => {
    // 签名消息
    const signedMessage = signMessage(message, keyPair.secretKey);
    expect(signedMessage).toBeTruthy();
    expect(typeof signedMessage).toBe("string");

    // 验证并解码消息
    const verifiedMessage = verifySignedMessage(
      signedMessage,
      keyPair.publicKey
    );
    expect(verifiedMessage).toBe(message);

    // 验证解码后的JSON内容
    const parsedMessage = JSON.parse(verifiedMessage);
    expect(parsedMessage).toEqual({
      username: "中文12",
      userId: "0d6a321acf",
      publicKey: "fZYYyQby6_CdTBKGAuRDvyWY_rniNCufwOxc-FCHkXw",
    });
  });

  test("Detached signature test", () => {
    // 生成独立签名
    const signature = detachedSign(message, keyPair.secretKey);
    expect(signature).toBeTruthy();
    expect(typeof signature).toBe("string");

    // 验证独立签名
    const isVerified = verifyDetachedSignature(
      message,
      signature,
      keyPair.publicKey
    );
    expect(isVerified).toBe(true);
  });

  test("Failed verification tests", () => {
    // 测试错误的公钥
    const wrongKeyPair = generateKeyPairFromSeedV1("wrong-seed");
    const signedMessage = signMessage(message, keyPair.secretKey);

    expect(() => {
      verifySignedMessage(signedMessage, wrongKeyPair.publicKey);
    }).toThrow();

    // 测试被篡改的消息
    const signature = detachedSign(message, keyPair.secretKey);
    const isVerified = verifyDetachedSignature(
      message + "tampered",
      signature,
      keyPair.publicKey
    );
    expect(isVerified).toBe(false);
  });
});
