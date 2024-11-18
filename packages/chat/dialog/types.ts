import { DataType } from "create/types";

interface DialogData {
  type: DataType.Dialog;
  cybots: string[];
  messageListId: string;
  title: string;
  category: string;
}

interface DialogConfig {
  data: DialogData;
  flags: {
    isJSON: boolean;
  };
  userId: string;
}
