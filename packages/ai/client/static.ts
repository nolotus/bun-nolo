import {nolotusId} from 'core/init';
import {getUserId} from 'auth/client/token';
import {writeHashData} from 'database/client/write';

export interface TokenStaticData {
  type: 'tokenStatistics';
  dialogType: 'send' | 'receive';
  model: string;
  length: number;
  userId: string;
  username: string;
  chatId?: string;
  chatCreated?: string;
}

export const tokenStatic = (data: TokenStaticData): void => {
  const userId = getUserId();

  if (userId === nolotusId) {
    writeHashData({...data, type: 'tokenStatistics'}, {isJSON: true});
  } else {
    writeHashData({...data, type: 'tokenStatistics'}, {isJSON: true});
    writeHashData({...data, type: 'tokenStatistics'}, {isJSON: true}, userId);
  }
};
