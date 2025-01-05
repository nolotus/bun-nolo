import { selectCurrentUserId, selectIsLoggedIn } from "auth/authSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";

import { addOne } from "../dbSlice";
import { noloWriteRequest } from "../requests/writeRequest";
import { DataType } from "create/types";
import { Level } from "level";
export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;

  const currenUserId = selectCurrentUserId(state);
  let userId = currenUserId ? currenUserId : "local";
  const isLoggedIn = selectIsLoggedIn(state);
  // thunkApi.dispatch(syncWrite(state));
  const { data } = writeConfig;
  if (data.type === DataType.Cybot) {
    console.log("write cyot", data);
    const id = `${data.type}-${userId}-${ulid()}`;
    const willSaveData = {
      ...data,
      created: new Date().toISOString(),
      id,
    };
    const db = new Level("nolo", { valueEncoding: "json" });
    const result = await db.put(id, willSaveData);
    console.log("result", result);
    return { id };
  } else {
    //id maybe exist
    // pulldata upsertdata
    const { id, flags } = writeConfig;
    const customId = id ? id : ulid();
    const { isJSON, isList, isObject } = flags;
    if (writeConfig.userId) {
      userId = writeConfig.userId;
    }
    userId = currenUserId;
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
    }
  }
};
