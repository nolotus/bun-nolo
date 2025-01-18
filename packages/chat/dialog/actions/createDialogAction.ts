import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { createDialogKey } from "database/keys";
import { format } from "date-fns";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const cybotId = cybots[0];

  console.log("[createDialog] Creating dialog for cybot:", cybotId);

  const cybotConfig = await dispatch(read(cybotId)).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = cybotConfig.name + "  " + time;
  const userId = selectCurrentUserId(thunkApi.getState());
  const id = createDialogKey(userId);

  console.log("[createDialog] Generated dialog:", {
    title,
    userId,
    id,
    category,
  });

  const data = {
    cybots,
    category,
    title,
    id,
    type: DataType.DIALOG,
  };

  const result = await dispatch(write({ data, customId: id })).unwrap();

  console.log("[createDialog] Dialog created successfully:", id);

  return result;
};
