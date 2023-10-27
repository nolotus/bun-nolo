import { ResponseData } from "../types";

import { sendWriteRequest } from "./request";

import { Flags } from "core/prefix";
import { nolotusId } from "core/init";

export const writeData = async (
  data,
  flags: Flags,
  customId: string,
  userId: string = nolotusId,
  host: window.location.origin
): Promise<ResponseData> => {
  try {
    const responseData = await sendWriteRequest(
      {
        data,
        flags,
        customId,
        userId,
      },
      host
    );
    return responseData;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const writeHashData = async (
  data,
  flags: Flags,
  userId: string = nolotusId
): Promise<ResponseData> => {
  try {
    const requestData = {
      data,
      flags: { isHash: true, ...flags },
      userId,
    };
    const responseData = await sendWriteRequest(requestData);
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
