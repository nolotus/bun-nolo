import fs from "fs";
import { extractUserId } from "core/prefix";

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === "Access denied" ? 401 : 500;
  res.status(status).json({ error: error.message });
};

const updateData = async (acitonUserId, id, newData) => {
  //make sure that the user is the owner of the data
  console.log("id", id);
  const userId = extractUserId(id);
  const filePath = `./nolodata/${userId}/index.nolo`;
  console.log("filePath", filePath);
  const fileContent = await fs.promises.readFile(filePath, "utf-8");
  console.log("fileContent", fileContent);

  const lines = fileContent.split("\n");

  const index = lines.findIndex((line) => line.startsWith(id));

  if (index === -1) {
    throw new Error("Data not found");
  }

  lines[index] = `${id} ${newData}`;
  await fs.promises.writeFile(filePath, lines.join("\n"));
};

export const handleUpdate = async (req, res) => {
  const { user } = req;
  const acitonUserId = user.userId;
  let id = req.params.id;
  try {
    const { data } = req.body;

     await updateData(acitonUserId, id, data);
     return res.status(200).json({ message: "Data updated successfully." });
  } catch (error) {
    handleError(res, error);
  }
};
