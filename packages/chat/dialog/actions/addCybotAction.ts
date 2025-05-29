import { patch, selectById } from "database/dbSlice";
import { selectCurrentDialogKey } from "chat/dialog/dialogSlice";
import { formatISO } from "date-fns";

export const addCybotAction = async (cybotIds: string | string[], thunkApi) => {
  const { dispatch, getState } = thunkApi;
  const currentDialogKey = selectCurrentDialogKey(getState());

  if (!currentDialogKey) {
    throw new Error("No current dialog selected");
  }

  const dialogConfig = selectById(getState(), currentDialogKey);
  if (!dialogConfig) {
    throw new Error("Dialog configuration not found");
  }

  // 统一处理为数组格式
  const idsToAdd = Array.isArray(cybotIds) ? cybotIds : [cybotIds];

  // 验证输入
  if (idsToAdd.length === 0) {
    throw new Error("No cybot IDs provided");
  }

  // 过滤掉空值和重复值
  const validIds = idsToAdd.filter((id) => id && typeof id === "string");

  if (validIds.length === 0) {
    throw new Error("No valid cybot IDs provided");
  }

  // 合并新的 ID 并去重
  const existingCybots = dialogConfig.cybots || [];
  const allCybots = [...existingCybots, ...validIds];
  const updatedCybots = allCybots.filter(
    (id, index) => allCybots.indexOf(id) === index
  );

  const changes = {
    cybots: updatedCybots,
    updatedAt: formatISO(new Date()),
  };

  const updatedConfig = await dispatch(
    patch({ dbKey: currentDialogKey, changes })
  ).unwrap();

  return updatedConfig;
};
