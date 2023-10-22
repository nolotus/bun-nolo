import {createWriteStream} from 'node:fs';
import {promises as fs} from 'fs';
import {promisify} from 'util';
import {pipeline, Readable} from 'stream';
import {dirname} from 'path';
import {formatData} from 'core/formatData';

// import {WriteDataRequestBody} from '../types';

import {generateKey} from 'core/generateMainKey';
import {nolotusId} from 'core/init';

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === 'Access denied' ? 401 : 500;
 return  res.status(status).json({error: error.message});
};

const pipelineAsync = promisify(pipeline);

const allowType = {
  [nolotusId]: ['tokenStatistics'],
};
export const writeData = async (dataKey, data, userId) => {
  console.log('writeData');
  const path = `./nolodata/${userId}/index.nolo`;
  try {
    await fs.access(dirname(path));
  } catch {
    throw new Error('没有该用户');
  }
  const output = createWriteStream(path, {flags: 'a'});
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
};

export const handleWrite = async (
  req,
  res,
) => {
  const {user} = req;
  const actionUserId = user.userId;
  const {userId, data, flags, customId} = req.body;
  const saveUserId = userId;

  const isWriteSelf = actionUserId === saveUserId;
  const value = formatData(data, flags);

  if (isWriteSelf) {
    try {
      if (value.includes('\n')) {
        res.status(400).json({
          message: 'Data contains newline character and is not allowed.',
        });
        return;
      }

      const dataId = generateKey(value, saveUserId, flags, customId);
      await writeData(dataId, value, saveUserId);
      res.status(200).json({
        message: 'Data written to file successfully.',
        dataId,
      });
    } catch (error) {
    return   handleError(res, error);
    }
  } else {

    const userRule =allowType[saveUserId]
    const isAllowType = userRule?.includes(data.type);

    if (isAllowType) {
      const dataId = generateKey(value, saveUserId, flags, customId);
      await writeData(dataId, value, saveUserId);
    return   res.status(200).json({
        message: 'Data written to file successfully.',
        dataId,
      });
    } else {
    return   res.status(403).json({
        message: '操作不被允许.',
      });
    }
  }
};
