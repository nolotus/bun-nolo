import fs from "fs";

import { extractUserId } from "core/prefix";

const deleteFromFile = async (filePath: string, id: string) => {
	const fileContent = await fs.promises.readFile(filePath, "utf-8");
	const lines = fileContent.split("\n");
	const newLines = lines.filter((line) => !line.startsWith(id));
	await fs.promises.writeFile(filePath, newLines.join("\n"));
	console.log("Data deleted successfully.");
};

const deleteData = async (id: string, actionUserId: string) => {
	const userId = extractUserId(id);
	if (actionUserId === userId) {
		const indexPath = `./nolodata/${userId}/index.nolo`;
		const hashPath = `./nolodata/${userId}/hash.nolo`;
		await deleteFromFile(indexPath, id);
		await deleteFromFile(hashPath, id);
	} else {
		// 如果操作用户 ID 和数据用户 ID 不匹配，抛出一个错误
		throw new Error("Unauthorized action.");
	}
};

export const handleDelete = async (req, res) => {
	const { user } = req;
	const actionUserId = user.userId;
	try {
		const { id } = req.params;
		await deleteData(id, actionUserId);
		return res.status(200).json({ message: "Data deleted successfully." });
	} catch (error) {
		console.error(error);
		const status = error.message === "Access denied" ? 401 : 500;
		return res.status(status).json({ error: error.message });
	}
};
