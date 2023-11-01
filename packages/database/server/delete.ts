import fs from 'fs';

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === 'Access denied' ? 401 : 500;
  res.status(status).json({ error: error.message });
};

const deleteData = async (dataKey, userId) => {
  const filePath = `./nolodata/${userId}/index.nolo`;
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const newLines = lines.filter((line) => !line.startsWith(dataKey));
  await fs.promises.writeFile(filePath, newLines.join('\n'));
  console.log('Data deleted successfully.');
};

export const handleDelete = async (req, res) => {
  const { user } = req;
  try {
    const { dataKey } = req.body;
    await deleteData(dataKey, user.userId);
    return res.status(200).json({ message: 'Data deleted successfully.' });
  } catch (error) {
    handleError(res, error); // 注意：请确保你已经定义了 handleError 函数，或者用你的错误处理逻辑替换此行
  }
};
