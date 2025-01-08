import { DataType } from "create/types";
import { read, write } from "database/dbSlice";
import { format } from "date-fns";

export const createDialogAction = async (args, thunkApi) => {
  const { cybots, category } = args;
  const dispatch = thunkApi.dispatch;
  const cybotId = cybots[0];

  const cybotConfig = await dispatch(read({ id: cybotId })).unwrap();
  const time = format(new Date(), "MM-dd HH:mm");
  const title = cybotConfig.name + "  " + time;
  const data = {
    type: DataType.Dialog,
    cybots,
    category,
    title,
  };

  const result = await dispatch(write({ data })).unwrap();

  return result;
};
