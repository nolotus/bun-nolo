import {Flags} from 'core/prefix';
import {generateIdWithCustomId} from 'core/generateMainKey';
import { API_ENDPOINTS } from "../config";

export const readOwnData = async (
  userId: string,
  customId: string,
  flags: Flags,
) => {
  const dataId = generateIdWithCustomId(userId, customId, flags);
  const   validUrl = `${API_ENDPOINTS.DATABASE}/read/${dataId}`;
  return await fetch(validUrl).then(res => {
    return res.json();
  });
};

  export async function readData(dataId:string){
    let validUrl = `https://nolotus.com${API_ENDPOINTS.DATABASE}/read/${dataId}`;
    console.log('validUrl',validUrl)
    return await fetch(validUrl).then(res => {
      return res.json();
    });
  }