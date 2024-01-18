import { promises as fs } from "fs";
import { createWriteStream } from "node:fs";
import { dirname } from "path";
import { pipeline, Readable } from "stream";
import { promisify } from "util";

import { formatData } from "core/formatData";
import { generateKey } from "core/generateMainKey";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { extractUserId } from "core";
import { extractAndDecodePrefix } from "core/prefix";
// import {WriteDataRequestBody} from '../types';

export const handleError = (res, error) => {
	console.error(error);
	const status = error.message === "Access denied" ? 401 : 500;
	return res.status(status).json({ error: error.message });
};

const pipelineAsync = promisify(pipeline);

const allowType = {
	[nolotusId]: [DataType.TokenStatistics],
};
export const writeData = async (dataKey, data, userId) => {
	const path = `./nolodata/${userId}/index.nolo`;
	try {
		await fs.access(dirname(path));
	} catch {
		throw new Error("没有该用户");
	}
	const result = extractAndDecodePrefix(dataKey);
	const { isFile } = result;
	if (isFile) {
		const mimeTypes = {
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"application/pdf": ".pdf",
			// ...其它MIME类型及对应后缀
		};
		const fileExtension = mimeTypes[data.type] || ""; // 如果找不到对应的MIME类型, 返回空字符串作为后缀

		await Bun.write(`nolodata/${userId}/${dataKey}`, data);
	}
	const output = createWriteStream(path, { flags: "a" });
	await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
};

export const handleWrite = async (req, res) => {
	const { user } = req;
	const actionUserId = user.userId;
	if (req.body instanceof FormData) {
		const formData = req.body;
		const fileBlob = formData.get("file");
		const clientGeneratedID = formData.get("dataId");
		const saveUserId = extractUserId(clientGeneratedID);
		await writeData(clientGeneratedID, fileBlob, saveUserId);
		return res
			.status(200)
			.json({ message: "success", dataId: clientGeneratedID });
	}

	const { userId, data, flags, customId } = req.body;
	const saveUserId = userId;
	const isWriteSelf = actionUserId === saveUserId;
	const value = formatData(data, flags);

	if (value.includes("\n")) {
		return res.status(400).json({
			message: "Data contains newline character and is not allowed.",
		});
	}
	const dataId = generateKey(value, saveUserId, flags, customId);

	if (isWriteSelf) {
		try {
			await writeData(dataId, value, saveUserId);
			return res.status(200).json({
				message: "Data written to file successfully.",
				dataId,
			});
		} catch (error) {
			return handleError(res, error);
		}
	} else {
		const userRule = allowType[saveUserId];
		const isAllowType = userRule?.includes(data.type);

		if (isAllowType) {
			await writeData(dataId, value, saveUserId);
			return res.status(200).json({
				message: "Data written to file successfully.",
				dataId,
			});
		}
		return res.status(403).json({
			message: "操作不被允许.",
		});
	}
};
