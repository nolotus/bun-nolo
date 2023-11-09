import { unlink } from 'node:fs/promises';

import { formatData, extractAndDecodePrefix, extractUserId } from 'core';

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === 'Access denied' ? 401 : 500;
  res.status(status).json({ error: error.message });
};

import { readLines } from 'utils/bun/readLines'; // Ensure this points to the location of your readLines function

const updateData = async (actionUserId, id, data) => {
  const userId = extractUserId(id);
  const filePath = `./nolodata/${userId}/index.nolo`;
  const tempFilePath = `${filePath}.tmp`;

  const writer = Bun.file(tempFilePath).writer({ flags: 'w' });
  const flags = extractAndDecodePrefix(id);

  const value = formatData(data, flags);
  try {
    let updated = false;
    const fileStream = Bun.file(filePath).stream();
    for await (const line of readLines(fileStream)) {
      if (line.startsWith(id)) {
        await writer.write(`${id} ${value}\n`);
        updated = true;
      } else {
        await writer.write(`${line}\n`);
      }
    }

    await writer.end();

    if (updated) {
      await unlink(filePath);
      await Bun.write(filePath, Bun.file(tempFilePath));
      await unlink(tempFilePath);
    } else {
      await unlink(tempFilePath);
      throw new Error('Data not found');
    }
  } catch (error) {
    await unlink(tempFilePath);
    throw error;
  }
};

export const handleUpdate = async (req, res) => {
  const { user } = req;
  const acitonUserId = user.userId;
  let id = req.params.id;
  try {
    const data = req.body;
    await updateData(acitonUserId, id, data);
    return res.status(200).json({ message: 'Data updated successfully.' });
  } catch (error) {
    handleError(res, error);
  }
};
