import { createReadStream } from 'node:fs';
import readline from 'readline';

import { processLine } from 'core/decodeData';
import { getLogger } from 'utils/logger';

const readLogger = getLogger('readAll');

export const serverGetAllData = (userId, stream) => {
  if (stream) {
  } else {
    return new Promise((resolve, reject) => {
      let data = []; // Array to store all data
      const input = createReadStream(`./nolodata/${userId}/index.nolo`);

      input.on('error', (err) => reject(err));

      const rl = readline.createInterface({ input });

      rl.on('line', (line) => {
        const [id, value] = processLine(line);
        readLogger.info({ id, value }, 'processLine');
        if (id && id.includes(userId)) {
          data.push({ id, ...value }); // Add data to array
        }
      });

      rl.on('close', () => {
        readLogger.info({ data }, 'All data');
        resolve(data); // Resolve with all data
      });

      rl.on('error', (err) => reject(err)); // Handles other types of errors
    });
  }
};

export const handleReadAll = async (req, res) => {
  try {
    const { userId, stream = false } = req.body; // 从请求体中获取 userId 和 stream

    readLogger.info({ userId, stream }, 'Received userId and stream options');

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const data = await serverGetAllData(userId, stream); // 传递 userId 和 stream 到 serverGetAllData 函数

    return res.json(data);
  } catch (err) {
    readLogger.error({ error: err.message }, 'Error in handleReadAll function');
    return res.status(500).json({ error: err.message });
  }
};
