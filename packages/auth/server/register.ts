import fs from "fs";
import path from "path";

import { signMessage } from "core/crypto";
import { generateUserId } from "core/generateMainKey";
import { t } from "i18next";
import { getLogger } from "utils/logger";

import { DATABASE_DIR, DEFAULT_INDEX_FILE } from "./init";

const registerLogger = getLogger("register");

// 生成文件内容
const generateFileContent = (
	publicKey,
	username,
	encryptedEncryptionKey,
	remoteRecoveryPassword,
	userId,
) => {
	const publicKeyId = `0-${userId}-publicKey`;
	const usernameId = `0-${userId}-username`;
	const encryptedEncryptionKeyId = `0-${userId}-encryptedEncryptionKey`;
	const remoteRecoveryPasswordId = `0-${userId}-remoteRecoveryPassword`;

	return [
		`${publicKeyId} ${publicKey}`,
		`${usernameId} ${username}`,
		`${encryptedEncryptionKeyId} ${encryptedEncryptionKey}`,
		`${remoteRecoveryPasswordId} ${remoteRecoveryPassword}`,
		"", // 添加一个空行，相当于在文件末尾添加一个换行符
	].join("\n");
};

export async function handleRegister(req, res) {
	const {
		username,
		publicKey,
		encryptedEncryptionKey,
		remoteRecoveryPassword,
		language,
	} = req.body;
	const userId = generateUserId(publicKey, username, language);
	registerLogger.info({ userId }, "userId");

	const userDirPath = path.join(DATABASE_DIR, userId);

	const isExists = fs.existsSync(userDirPath);
	if (isExists) {
		return res
			.status(409)
			.json({ message: t("errors.dataExists", { id: userId }) });
	}
	registerLogger.info({ isExists }, "isExists");

	const filePath = path.join(userDirPath, DEFAULT_INDEX_FILE);

	const fileContent = generateFileContent(
		publicKey,
		username,
		encryptedEncryptionKey,
		remoteRecoveryPassword,
		userId,
	);
	registerLogger.info({ fileContent }, "fileContent");

	const message = JSON.stringify({
		username,
		userId,
		publicKey,
	});
	const secretKey = process.env.SECRET_KEY;
	registerLogger.info({ message, secretKey }, "message,secretKey");

	const encryptedData = signMessage(message, secretKey);
	registerLogger.info({ encryptedData }, "encryptedData");

	fs.mkdirSync(userDirPath, { recursive: true });
	fs.writeFileSync(filePath, fileContent);
	registerLogger.info({ userId, username }, "User data successfully saved.");

	return res.status(200).json({ encryptedData });
}
