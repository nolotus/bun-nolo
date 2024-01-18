import { base64UrlToUint8Array } from "./base64";

describe("base64UrlToUint8Array", () => {
	test("should convert valid base64Url to Uint8Array", () => {
		const input = "aGVsbG8td29ybGQh";
		const output = base64UrlToUint8Array(input);
		const expectedOutput = new Uint8Array([
			104, 101, 108, 108, 111, 45, 119, 111, 114, 108, 100, 33,
		]);

		console.log("Actual output:", Array.from(output));
		console.log("Expected output:", Array.from(expectedOutput));

		expect(Array.from(output)).toEqual(Array.from(expectedOutput));
	});
	test("should convert empty base64Url to empty Uint8Array", () => {
		const input = "";
		const output = base64UrlToUint8Array(input);
		const expectedOutput = new Uint8Array();
		expect(output).toEqual(expectedOutput);
	});

	// 如果有错误处理的话，可以添加此测试
	test("should handle invalid characters in base64Url string", () => {
		const input = "aGVsbG8#d29ybGRfIQ==";
		const output = () => base64UrlToUint8Array(input);
		expect(output).toThrow(/Invalid character in input base64Url string/); // 修改在这里
	});
});
