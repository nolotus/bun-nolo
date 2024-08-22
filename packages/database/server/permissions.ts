// permissions.ts

import { DataType } from "create/types";
import { nolotusId } from "core/init";
import { isIdInDeleteQueueCache } from "database/server/cache";

export const allowIds = ["domain-list"];
export const allowType = {
  [nolotusId]: [DataType.TokenStats],
};

export const checkPermission = (
  actionUserId: string,
  saveUserId: string,
  data: any,
  customId?: string,
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
  // 检查是否是删除数据
  if (isIdInDeleteQueueCache(userId, id)) {
    return false;
  }

  // 这里可以添加其他的权限检查逻辑
  return true;
};

export const validateUserAction = (
  actionUserId: string,
  dataBelongUserId: string,
) => {
  if (actionUserId !== dataBelongUserId) {
    throw new Error("Unauthorized action.");
  }
};

export const checkDeletePermission = (
  actionUserId: string,
  dataBelongUserId: string,
): boolean => {
  return actionUserId === dataBelongUserId;
};
