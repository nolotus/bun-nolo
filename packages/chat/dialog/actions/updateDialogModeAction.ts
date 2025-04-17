import { patch } from "database/dbSlice";
import { selectCurrentDialogKey } from "chat/dialog/dialogSlice";
import { DialogInvocationMode } from "chat/dialog/types";
import { formatISO } from "date-fns";

export const updateDialogModeAction = async (
  mode: DialogInvocationMode,
  thunkApi
) => {
  const { dispatch, getState } = thunkApi;
  const currentDialogKey = selectCurrentDialogKey(getState());

  if (!currentDialogKey) {
    throw new Error("No current dialog selected");
  }

  const changes = {
    mode,
    updatedAt: formatISO(new Date()),
  };

  const updatedConfig = await dispatch(
    patch({ dbKey: currentDialogKey, changes })
  ).unwrap();
  return updatedConfig;
};
