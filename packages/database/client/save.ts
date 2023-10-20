import {generateIdWithCustomId} from 'core/generateMainKey';
import {Flags} from 'core/prefix';
import {getUserId} from 'auth/client/token';
import {readData} from './read';
import {updateData} from './update';
import {writeData} from './write';

export const saveData = async (data, customId, flags: Flags) => {
  try {
    const userId = getUserId();
    const id = generateIdWithCustomId(userId, customId, flags);
    const existingData = await readData(id);
    console.log('existingData', existingData);
    if (!existingData) {
      // 如果数据不存在，则写入新数据
      return await writeData(data, flags, customId);
    } else {
      // 如果数据存在，则更新现有数据
      return await updateData(data, id);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
