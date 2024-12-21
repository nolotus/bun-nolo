import { extractAndDecodePrefix, formatData } from "core";
import { mem } from "./mem";
import { serverGetData } from "./read";

export const handlePatch = async (req, res) => {
	const id = req.params.id;
	const body = req.body;
	const result = await serverGetData(id);
	const changes = body;
	const { user } = req;
	const actionUserId = user.userId;

	//need check patch permission
	const data = { ...result, ...changes };
	const flags = extractAndDecodePrefix(id);

	const value = formatData(data, flags);
	mem.set(id, value);
	return res
		.status(200)
		.json({ data: { id, ...data }, message: "Data patched successfully." });
};
