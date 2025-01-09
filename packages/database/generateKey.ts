import { ulid } from "ulid";
import { DataType } from "create/types";
export const generateDialogKey = (userId: string) =>
  `${DataType.DIALOG}-${userId}-${ulid()}`;

export const generateCybotKey = (userId: string) =>
  `${DataType.CYBOT}-${userId}-${ulid()}`;

export const generateDialogMessageKey = (dialogId: string) =>
  `dialog-${dialogId}-msg-${ulid()}`;
