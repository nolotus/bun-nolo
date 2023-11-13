import { nolotusId } from 'core/init';
import { WriteHashDataType } from 'database/types';

export interface TokenStaticData {
  type: 'tokenStatistics';
  dialogType: 'send' | 'receive';
  model: string;
  length: number;
  userId: string;
  username: string;
  chatId?: string;
  chatCreated?: string;
  date: Date;
}

export const tokenStatic = (data, auth, writeHashData) => {
  const writeData: WriteHashDataType = {
    data: { ...data, type: 'tokenStatistics' },
    flags: { isJSON: true },
    userId: nolotusId,
  };
  console.log('writeData', writeData);

  if (auth.user?.userId === nolotusId) {
    writeHashData(writeData);
  } else {
    //write to nolotus
    console.log('writeData', writeData);
    writeHashData(writeData);
    //write to user
    writeHashData({ ...writeData, userId: auth.user?.userId });
  }
};
