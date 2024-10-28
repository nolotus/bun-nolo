import { extractAndDecodePrefix, formatData } from "core";
import { serverGetData } from "./read";
import { mem } from "./mem";

export const handlePatch = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
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
