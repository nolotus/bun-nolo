import { selectCurrentUserId, selectIsLoggedIn } from "auth/authSlice";
import { ulid } from "ulid";
import { generateIdWithCustomId } from "core/generateMainKey";

import { addOne } from "../dbSlice";
import { noloWriteRequest } from "../write/writeRequest";
import { addToIndexedDB } from "../browser/indexedDBActions";

export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const currenUserId = selectCurrentUserId(state);
  const isLoggedIn = selectIsLoggedIn(state);
  // thunkApi.dispatch(syncWrite(state));
  let userId = "local";
  const { id, flags, data } = writeConfig;
  //id maybe exist
  // pulldata upsertdata
  const customId = id ? id : ulid();
  const { isJSON, isList, isObject } = flags;
  if (writeConfig.userId) {
    userId = writeConfig.userId;
  }
  if (isLoggedIn) {
    userId = currenUserId;
  }
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
  //local save
  if (!isLoggedIn) {
    console.log("addDataToIndexedDB", saveId, willSaveData);
    addToIndexedDB(willSaveData, userId);
    // dispatch(addOne(willSaveData));
  }

  if (isJSON || isObject) {
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
};
