// permissions.ts

import { DataType } from "create/types";
import { nolotusId } from "core/init";
import { promises as fs } from "fs";
import { dirname } from "path";

export const allowIds = ["domain-list"];
export const allowType = {
  [nolotusId]: [DataType.TOKEN],
};

export const checkPermission = (
  actionUserId: string,
  saveUserId: string,
  data: any,
  customId?: string
): boolean => {
  const isWriteSelf = actionUserId === saveUserId;
  if (isWriteSelf) {
    return true;
  }
  const userRule = allowType[saveUserId];
  const isAllowType = userRule?.includes(data.type);
  const isAllowId = allowIds.includes(customId);
  return isAllowType || isAllowId;
};

export const checkReadPermission = (userId: string, id: string): boolean => {
  // 这里可以添加其他的权限检查逻辑
  return true;
};

export const validateUserAction = (
  actionUserId: string,
  dataBelongUserId: string
) => {
  if (actionUserId !== dataBelongUserId) {
    throw new Error("Unauthorized action.");
  }
};

export const doesUserDirectoryExist = async (
  userId: string
): Promise<boolean> => {
  const path = `./nolodata/${userId}/index.nolo`;

  try {
    await fs.access(dirname(path));
    return true;
  } catch {
    return false;
  }
};
