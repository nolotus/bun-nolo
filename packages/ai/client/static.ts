import { nolotusId } from "core/init";
import { writeHashData } from "database/client/write";
import { useAuth } from "app/hooks";

export interface TokenStaticData {
  type: "tokenStatistics";
  dialogType: "send" | "receive";
  model: string;
  length: number;
  userId: string;
  username: string;
  chatId?: string;
  chatCreated?: string;
  date: Date;
}

export const tokenStatic = (data: TokenStaticData): void => {
  const auth = useAuth();
  if (auth.user?.userId === nolotusId) {
    writeHashData({ ...data, type: "tokenStatistics" }, { isJSON: true });
  } else {
    writeHashData({ ...data, type: "tokenStatistics" }, { isJSON: true });
    writeHashData(
      { ...data, type: "tokenStatistics" },
      { isJSON: true },
      auth.user?.userId
    );
  }
};
