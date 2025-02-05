import { TokenUsageData, TokenRecord } from "ai/token/types";
import { DataType } from "create/types";
import { createTokenKey } from "database/keys";
import { write } from "database/dbSlice";
import toast from "react-hot-toast";

export const saveTokenRecord = async (
  tokenData: TokenUsageData,
  record: TokenRecord,
  thunkApi
) => {
  const key = createTokenKey.record(tokenData.userId, tokenData.timestamp);

  try {
    await thunkApi.dispatch(
      write({
        data: { ...record, id: key, type: DataType.TOKEN },
        customId: key,
      })
    );
    return true;
  } catch (error) {
    toast.error("Failed to save token record");
    return false;
  }
};
