import { SHA3 } from "crypto-js";
import CryptoJS from "crypto-js";

export const generateFileID = (buffer) => {
	// 假设buffer是Node.js Buffer类型
	// 将Node.js Buffer转换为CryptoJS兼容的格式
	const wordArray = CryptoJS.lib.WordArray.create(buffer);

	// 使用SHA3并指定输出长度为256位
	const id = SHA3(wordArray, { outputLength: 256 }).toString();
	return id;
};
