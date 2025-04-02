import serverDb from "./db";

export const handleReadSingle = async (req, res) => {
  if (!req.params.id) {
    return res.status(500).json({ error: "need id" });
  }

  const dbKey = req.params.id;
  try {
    const result = await serverDb.get(dbKey);
    if (!result) {
      return res.status(404).json({
        error: "Not Found",
        message: `Resource with id ${dbKey} not found`,
      });
    }

    return res.status(200).json({ ...result });
  } catch (error) {
    console.error("Database fetch error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch data",
    });
  }
};
