// app/space/addSpaceAction.ts

import { SpaceMemberWithSpaceInfo } from "app/types";
import {
  MemberRole,
  SpaceVisibility,
  SpaceData,
  SpaceContent,
} from "app/types";
import { selectUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { fetchUserData } from "database/browser/fetchUserData";
import { ulid } from "ulid";
import { patch, write } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { CreateSpaceRequest, selectAllMemberSpaces } from "./spaceSlice";
import type { AppDispatch, RootState } from "app/store";

//
// Helper: 一次性读取本地用户数据
//
interface BaseItem {
  id: string;
  type: DataType;
  userId: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  [key: string]: any;
}

interface GetUserDataOptions {
  types: DataType | DataType[];
  userId: string;
  limit: number;
  isLoggedIn?: boolean;
  currentUserId?: string;
}

async function getUserDataOnce({
  types,
  userId,
  limit,
  isLoggedIn = false,
  currentUserId,
}: GetUserDataOptions): Promise<{
  data: BaseItem[];
  error?: Error;
}> {
  try {
    const typeArray = Array.isArray(types) ? types : [types];
    const effectiveUserId =
      userId === "local" && isLoggedIn && currentUserId
        ? currentUserId
        : userId;
    const localResults = await fetchUserData(typeArray, effectiveUserId);
    const localData = Object.values(localResults).flat();
    return { data: localData };
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Unknown error occurred");
    return { data: [], error };
  }
}

const targetTypes: DataType[] = [DataType.DIALOG, DataType.PAGE];

/**
 * 新增 Space，包括首次迁移旧侧边栏数据到 Space.contents
 */
export const addSpaceAction = async (
  input: CreateSpaceRequest,
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<SpaceMemberWithSpaceInfo> => {
  const {
    name,
    description = "",
    visibility = SpaceVisibility.PRIVATE,
  } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);
  if (!userId) throw new Error("User is not logged in.");

  const spaceId = ulid();
  const now = Date.now();
  const nowISO = new Date(now).toISOString();

  // 基本 Space 数据
  const spaceData: SpaceData = {
    id: spaceId,
    name,
    description,
    ownerId: userId,
    visibility,
    members: [userId],
    categories: {},
    contents: {},
    createdAt: now,
    updatedAt: now,
    type: DataType.SPACE,
  };

  const spaces = selectAllMemberSpaces(state);
  const hasSpace = spaces.length > 0;

  if (!hasSpace) {
    // 首次创建 Space 时尝试迁移旧侧边栏数据
    const { data: oldItems = [] } = await getUserDataOnce({
      types: targetTypes,
      userId,
      limit: 100,
    });

    const hasOldSideData = oldItems.length > 0;
    if (hasOldSideData) {
      const contents: Record<string, SpaceContent> = {};
      const updatePromises: Promise<any>[] = [];

      for (const item of oldItems) {
        if (!item.id || !item.type) continue;
        contents[item.id] = {
          title: item.title || "",
          type: item.type,
          contentKey: item.id,
          categoryId: "",
          pinned: false,
          createdAt: item.createdAt ?? now,
          updatedAt: item.updatedAt ?? now,
          order: item.order,
        };
        if (item.dbKey) {
          updatePromises.push(
            dispatch(
              patch({
                dbKey: item.dbKey,
                changes: { spaceId, updatedAt: now },
              })
            )
          );
        }
      }
      spaceData.contents = contents;
      await Promise.all(updatePromises);
    }
  }

  // 写入 Space
  const spaceKey = createSpaceKey.space(spaceId);
  await dispatch(write({ data: spaceData, customKey: spaceKey })).unwrap();

  // 写入 SpaceMember
  const spaceMemberKey = createSpaceKey.member(userId, spaceId);
  const spaceMemberData: SpaceMemberWithSpaceInfo = {
    dbKey: spaceMemberKey,
    type: DataType.SPACE,
    userId,
    role: MemberRole.OWNER,
    joinedAt: now,
    spaceId,
    spaceName: name,
    ownerId: userId,
    visibility,
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  await dispatch(
    write({ data: spaceMemberData, customKey: spaceMemberKey })
  ).unwrap();

  return spaceMemberData;
};
