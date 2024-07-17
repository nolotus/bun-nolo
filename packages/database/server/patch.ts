import { extractAndDecodePrefix, formatData } from "core";
import { updateServerData } from "./put";
import { serverGetData } from "./read";

export const handlePatch = async (req, res) => {
  let id = req.params.id;
  let body = req.body;
  const result = await serverGetData(id);
  const changes = body;
  const { user } = req;
  const actionUserId = user.userId;
  const data = { ...result, ...changes };
  const flags = extractAndDecodePrefix(id);

  const value = formatData(data, flags);
  await updateServerData(actionUserId, id, value);
  return res
    .status(200)
    .json({ data: { id, ...data }, message: "Data patched successfully." });
};
