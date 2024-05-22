import { Flags } from "core/prefix";

export type WriteDataRequestBody = {
  data: string;
  flags: Flags;
  customId?: string;
};

// ResponseData.ts
export interface ResponseData {
  message: string;
  id: string;
}
export type WriteDataType = {
  data: any;
  flags: Flags;
  customId: string;
  userId?: string;
  domain?: string;
};

export type WriteHashDataType = {
  data: any;
  flags: Flags;
  userId?: string;
  domain?: string;
};
