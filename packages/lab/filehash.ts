import CryptoJS from "crypto-js";
import crypto from "crypto";
import { Buffer } from "buffer";

const TEST_SIZES = [
  1024, // 1KB
  1024 * 1024, // 1MB
  5 * 1024 * 1024, // 5MB
];

// 生成测试数据
const generateTestData = (size: number) => {
  return new Array(size).fill("a").join("");
};

// crypto-js 方式
const hashWithCryptoJS = (data: string) => {
  console.time("crypto-js");
  const hash = CryptoJS.MD5(data).toString();
  console.timeEnd("crypto-js");
  return hash;
};

// buffer 方式
const hashWithBuffer = (data: string) => {
  console.time("buffer");
  const hash = crypto.createHash("md5").update(Buffer.from(data)).digest("hex");
  console.timeEnd("buffer");
  return hash;
};

// 运行测试
const runTest = async () => {
  for (const size of TEST_SIZES) {
    console.log(`\nTesting with ${size / 1024}KB data:`);
    const testData = generateTestData(size);

    // 预热
    hashWithCryptoJS(testData);
    hashWithBuffer(testData);

    // 实际测试
    console.log("First run:");
    const hash1 = hashWithCryptoJS(testData);
    const hash2 = hashWithBuffer(testData);

    console.log("Second run:");
    const hash3 = hashWithCryptoJS(testData);
    const hash4 = hashWithBuffer(testData);

    // 验证结果一致性
    console.log(
      "Results match:",
      hash1 === hash2 && hash2 === hash3 && hash3 === hash4
    );
  }
};

// 执行测试
runTest().catch(console.error);
