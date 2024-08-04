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
