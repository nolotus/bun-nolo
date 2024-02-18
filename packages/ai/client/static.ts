import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { WriteHashDataType } from "database/types";
export interface TokenStaticData {
  type: DataType.TokenStats | DataType.TokenStatistics;
  dialogType: "send" | "receive";
  model: string;
  length: number;
  userId: string;
  username: string;
  chatId?: string;
  chatCreated?: string;
  date: Date;
}

export const tokenStatic = (data, auth, writeHashData) => {
  const writeData: WriteHashDataType = {
    data: { ...data, type: DataType.TokenStats },
    flags: { isJSON: true },
    userId: nolotusId,
  };

  if (auth.user?.userId === nolotusId) {
    writeHashData(writeData);
  } else {
    //write to nolotus
    writeHashData(writeData);
    //write to user
    writeHashData({ ...writeData, userId: auth.user?.userId });
  }
};
