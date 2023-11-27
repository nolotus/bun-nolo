import fs from 'fs';
import { createReadStream } from 'node:fs';
import readline from 'readline';

import { processLine } from 'core/decodeData';
import { DEFAULT_INDEX_FILE } from 'auth/server/init';
import { getLogger } from 'utils/logger';
const readDataLogger = getLogger('readData');

export const handleReadSingle = async (req, res) => {
  try {
    let id = req.params.id;
    const result = await serverGetData(id);
    readDataLogger.info({ id }, 'handleReadSingle result');
    if (result) {
      return res.status(200).json({ ...result, id });
    } else {
      return res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    readDataLogger.error({ error }, 'Error fetching data');
    return res
      .status(500)
      .json({ error: 'An error occurred while fetching data' });
  }
};

export const readIdFromIndexFile = async (dirPath, id) => {
  const filePath = `${dirPath}/${DEFAULT_INDEX_FILE}`;
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const input = createReadStream(filePath);
    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      const [key, value] = processLine(line);
      console.log('id', id);

      if (key === id) {
        console.log('hi', key);

        resolve(value);
        rl.close();
      }
    });

    rl.on('close', () => resolve(null));
    rl.on('error', (err) => reject(err));
  });
};

export const serverGetData = (id) => {
  readDataLogger.info({ id }, 'serverGetData');

  if (!id) {
    readDataLogger.info('id is empty');
    return Promise.resolve(null); // 如果 id 为空，立即返回 null
  }

  let parts = id.split('-');
  let userId = parts[1];

  // 检查 userId 是否未定义或无效
  if (!userId) {
    readDataLogger.info('userId is undefined or invalid');
    return Promise.resolve(null); // 如果 userId 未定义或无效，立即返回 null
  }

  const path = `./nolodata/${userId}/index.nolo`;

  // 检查文件是否存在
  if (!fs.existsSync(path)) {
    readDataLogger.info('File does not exist');
    return Promise.resolve(null); // 如果文件不存在，立即返回 null
  }

  return new Promise((resolve, reject) => {
    let found = false; // data found flag
    const input = createReadStream(path);

    input.on('error', (err) => reject(err));

    const rl = readline.createInterface({ input });

    rl.on('line', (line) => {
      const [key, value] = processLine(line);
      readDataLogger.info({ key, value }, 'processLine');
      if (id === key) {
        readDataLogger.info({ id, value }, 'result');
        found = true;
        resolve(value);
        rl.close();
      }
    });

    rl.on('close', () => {
      if (!found) {
        readDataLogger.info('id not found');
        resolve(null); // Resolve with null when id is not found
      }
    });

    rl.on('error', (err) => reject(err)); // Handles other types of errors
  });
};
