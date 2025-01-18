import serverDb from "./db";
// nomore need patch old db

export const handlePatch = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const changes = body;
  const { user } = req;
  const actionUserId = user.userId;
  //need check patch permission

  const exist = await serverDb.get(id);

  if (exist) {
    const final = { ...exist, ...changes };
    serverDb.put(id, final);
    return res
      .status(200)
      .json({ data: { id, ...final }, message: "Data patched successfully." });
  }
};
