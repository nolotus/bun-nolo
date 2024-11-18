import { noloWriteRequest } from "../write/writeRequest";
import { selectCurrentUser } from "auth/authSlice";
import { ulid } from "ulid";
import { generateIdWithCustomId } from "core/generateMainKey";
import { addOne } from "../dbSlice";

export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  // thunkApi.dispatch(syncWrite(state));
  let userId;
  const { id, flags, data } = writeConfig;
  const customId = id ? id : ulid();
  const { isJSON, isList, isObject } = flags;
  if (writeConfig.userId) {
    userId = writeConfig.userId;
  } else {
    const currenUserId = selectCurrentUser(state);
    userId = currenUserId;
  }
  const saveId = generateIdWithCustomId(userId, customId, flags);
  if (!!data.type) {
  }
  const willSaveData = { ...data, created: new Date().toISOString() };
  //local save
  if (isJSON || isObject) {
    dispatch(
      addOne({
        id: saveId,
        ...willSaveData,
      }),
    );
    //server save
    const serverWriteConfig = {
      ...writeConfig,
      data: willSaveData,
      customId,
    };
    const writeRes = await noloWriteRequest(state, serverWriteConfig);
    return await writeRes.json();
  }
  if (isList) {
    dispatch(addOne({ id: saveId, array: data }));
    //server save
    const serverWriteConfig = {
      ...writeConfig,
      customId,
    };
    const writeRes = await noloWriteRequest(state, serverWriteConfig);
    return await writeRes.json();
  }
};
