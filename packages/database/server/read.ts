import fs from "fs";
import { createReadStream } from "node:fs";
import readline from "readline";

import { processLine } from "core/decodeData";
import { DEFAULT_INDEX_FILE } from "auth/server/init";
import { getLogger } from "utils/logger";
const readDataLogger = getLogger("readData");

export const handleReadSingle = async (req, res) => {
	try {
		const id = req.params.id;
		const result = await serverGetData(id);
		readDataLogger.info({ id }, "handleReadSingle result");
		if (result) {
			return res.status(200).json({ ...result, id });
		}
		return res.status(404).json({ error: "Data not found" });
	} catch (error) {
		readDataLogger.error({ error }, "Error fetching data");
		return res
			.status(500)
			.json({ error: "An error occurred while fetching data" });
	}
};

export const readIdFromIndexFile = async (dirPath, id) => {
	const filePath = `${dirPath}/${DEFAULT_INDEX_FILE}`;
	if (!fs.existsSync(filePath)) {
		return null;
	}

	return new Promise((resolve, reject) => {
		const input = createReadStream(filePath);
		const rl = readline.createInterface({ input });

		rl.on("line", (line) => {
			const [key, value] = processLine(line);
			console.log("id", id);

			if (key === id) {
				resolve(value);
				rl.close();
			}
		});

		rl.on("close", () => resolve(null));
		rl.on("error", (err) => reject(err));
	});
};

const checkFileExists = (filePath) => {
	return fs.existsSync(filePath);
};
const findDataInFile = (filePath, id) => {
	return new Promise((resolve, reject) => {
		let found = false;
		const input = createReadStream(filePath);

		input.on("error", (err) => reject(err));

		const rl = readline.createInterface({ input });

		rl.on("line", (line) => {
			const [key, value] = processLine(line);
			readDataLogger.info({ key, value }, "processLine");
			if (id === key) {
				readDataLogger.info({ id, value }, "result");
				found = true;
				resolve(value);
				rl.close();
			}
		});

		rl.on("close", () => {
			if (!found) {
				readDataLogger.info("id not found");
				resolve(null);
			}
		});

		rl.on("error", (err) => reject(err));
	});
};
export const serverGetData = (id: string) => {
	readDataLogger.info({ id }, "serverGetData");

	if (!id) {
		readDataLogger.info("id is empty");
		return Promise.resolve(null);
	}

	const parts = id.split("-");
	const userId = parts[1];

	if (!userId) {
		readDataLogger.info("userId is undefined or invalid");
		return Promise.resolve(null);
	}

	const indexPath = `./nolodata/${userId}/index.nolo`;
	const hashPath = `./nolodata/${userId}/hash.nolo`;

	if (!checkFileExists(indexPath)) {
		readDataLogger.info("index file does not exist");
		return Promise.resolve(null);
	}
	if (!checkFileExists(hashPath)) {
		readDataLogger.info("hash file does not exist");
		return Promise.resolve(null);
	}

	return findDataInFile(indexPath, id).then((data) => {
		if (data) {
			readDataLogger.info("Data found in index file");
			return data;
		}
		if (id.startsWith("1")) {
			readDataLogger.info("Data not found in index file, searching hash file");
			return findDataInFile(hashPath, id).then((hashData) => {
				if (hashData) {
					readDataLogger.info("Data found in hash file");
				} else {
					readDataLogger.info("Data not found in hash file");
				}
				return hashData;
			});
		}
		readDataLogger.info(
			"Data not found in index file, and id does not start with '1'",
		);
		return null;
	});
};
