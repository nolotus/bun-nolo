import { queryData } from "./queryHandler";

import { QueryOptions } from "./types";
import { validateQueryOptions } from "./validation";

export const handleQuery = async (req, res) => {
  try {
    const options: QueryOptions = {
      userId: req.params.userId,
      isObject: req.query.isObject === "true",
      isJSON: req.query.isJSON === "true",
      condition: req.body,
      limit: Number(req.query.limit),
    };
    const isValid = validateQueryOptions(options);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const data = await queryData(options);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
