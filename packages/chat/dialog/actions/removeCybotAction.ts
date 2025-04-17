import { patch, selectById } from "database/dbSlice";
import { selectCurrentDialogKey } from "chat/dialog/dialogSlice";
import { formatISO } from "date-fns";

export const removeCybotAction = async (cybotId: string, thunkApi) => {
  const { dispatch, getState } = thunkApi;
  const currentDialogKey = selectCurrentDialogKey(getState());

  if (!currentDialogKey) {
    throw new Error("No current dialog selected");
  }

  const dialogConfig = selectById(getState(), currentDialogKey);
  if (!dialogConfig) {
    throw new Error("Dialog configuration not found");
  }

  const updatedCybots = dialogConfig.cybots
    ? dialogConfig.cybots.filter((id: string) => id !== cybotId)
    : [];

  const changes = {
    cybots: updatedCybots,
    updatedAt: formatISO(new Date()),
  };

  const updatedConfig = await dispatch(
    patch({ dbKey: currentDialogKey, changes })
  ).unwrap();
  return updatedConfig;
};
