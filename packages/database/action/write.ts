import { selectCurrentUserId, selectIsLoggedIn } from "auth/authSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { API_ENDPOINTS } from "database/config";

import { addOne } from "../dbSlice";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { Flags } from "core/prefix";
import { noloRequest } from "../requests/noloRequest";
interface WriteConfigServer {
  customId: string;
  flags: Flags;
  data: Record<string, any>;
  userId: string;
}

const noloWriteRequest = async (state: any, writeConfig: WriteConfigServer) => {
  const { userId, data, flags, customId } = writeConfig;

  const fetchConfig = {
    url: `${API_ENDPOINTS.DATABASE}/write/`,
    method: "POST",
    body: JSON.stringify({
      data,
      flags,
      customId,
      userId,
    }),
  };
  return await noloRequest(state, fetchConfig);
};

//data flagas userId id
export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const currenUserId = selectCurrentUserId(state);
  let userId = currenUserId;
  if (writeConfig.userId) {
    userId = writeConfig.userId;
  }
  const isLoggedIn = selectIsLoggedIn(state);
  const { data } = writeConfig;
  if (
    data.type === DataType.Cybot ||
    data.type === DataType.Page ||
    data.type === DataType.Token ||
    data.type === DataType.Dialog
  ) {
    const id: string = `${data.type}-${userId}-${ulid()}`;
    const willSaveData = {
      ...data,
      created: new Date().toISOString(),
      id,
    };
    await browserDb.put(id, willSaveData);
    const serverWriteConfig = {
      ...writeConfig,
      data: willSaveData,
    };
    const writeRes = await noloWriteRequest(state, serverWriteConfig);
    const json = await writeRes.json();
    console.log("json", json);
    return json;
  } else {
    //id maybe exist
    // pulldata upsertdata
    const { id, flags } = writeConfig;
    const customId = id ? id : ulid();
    const { isJSON, isList } = flags;

    if (isLoggedIn) {
      //here id should similar ulid
      const saveId = generateIdWithCustomId(userId, customId, flags);
      // maybe need limit with type
      // if (!!data.type) {
      // }
      const willSaveData = {
        ...data,
        created: new Date().toISOString(),
        id: saveId,
      };

      if (isJSON) {
        //server save
        const serverWriteConfig = {
          ...writeConfig,
          data: willSaveData,
          customId,
        };
        if (isLoggedIn) {
          const writeRes = await noloWriteRequest(state, serverWriteConfig);
          return await writeRes.json();
        }
      }
      if (isList) {
        dispatch(addOne({ id: saveId, array: data }));
        //server save
        //just default is empty list?
        const serverWriteConfig = {
          ...writeConfig,
          customId,
        };
        if (isLoggedIn) {
          const writeRes = await noloWriteRequest(state, serverWriteConfig);
          return await writeRes.json();
        }
      }
    }
  }
};
