import { Flags } from 'core/prefix';

export type WriteDataRequestBody = {
  data: string,
  flags: Flags,
  customId?: string,
};

// ResponseData.ts
export interface ResponseData {
  message: string;
  dataId: string;
}
export type WriteDataType = {
  data: any,
  flags: Flags,
  customId: string,
  userId?: string,
  host?: string,
};

export type WriteHashDataType = {
  data: any,
  flags: Flags,
  userId?: string,
};
