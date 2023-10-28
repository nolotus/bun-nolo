import { generateIdWithCustomId } from 'core/generateMainKey';
import { Flags } from 'core/prefix';

import { readData } from './read';
import { updateData } from './update';
import { writeData } from './write';

export const saveData = async (userId, data, customId, flags: Flags) => {
  try {
    const id = generateIdWithCustomId(userId, customId, flags);
    const existingData = await readData(id);
    if (!existingData) {
      // 如果数据不存在，则写入新数据
      return await writeData(data, flags, customId);
    } else {
      // 如果数据存在，则更新现有数据
      return await updateData(userId, data, id);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
