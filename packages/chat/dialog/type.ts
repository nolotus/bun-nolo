// chat/dialog/type.ts
import { DataType } from "create/types";

type UserId = string;
type CybotId = string;

export interface DialogData {
  type: DataType.Dialog;
  cybots: CybotId[];
  messageListId: string;
  title: string;
}

export interface DialogConfig {
  data: DialogData;
  flags: {
    isJSON: boolean;
  };
  userId: UserId;
}

export interface CreateDialogParams {
  cybots: CybotId[];
  users?: UserId[];
}
